from __future__ import annotations
import numpy as np
from dataclasses import dataclass
from scipy.integrate import solve_ivp

G = 9.80665

@dataclass
class Building:
    M: np.ndarray
    K: np.ndarray
    C: np.ndarray
    n: int
    influence: np.ndarray
    fn: np.ndarray

def build_shear_building(masses, story_stiffness, zeta=0.05):
    masses = np.asarray(masses, dtype=float).reshape(-1)
    k = np.asarray(story_stiffness, dtype=float).reshape(-1)
    if len(masses) != len(k):
        raise ValueError('masses and story_stiffness must match')
    if np.any(masses <= 0) or np.any(k <= 0):
        raise ValueError('positive masses/stiffness required')
    n = len(masses)
    M = np.diag(masses)
    K = np.zeros((n, n), float)
    for i in range(n):
        ki = k[i]
        K[i, i] += ki
        if i > 0:
            K[i-1, i-1] += ki
            K[i, i-1] -= ki
            K[i-1, i] -= ki
    Minvhalf = np.diag(1.0 / np.sqrt(masses))
    A = Minvhalf @ K @ Minvhalf
    evals, evecs = np.linalg.eigh(A)
    w = np.sqrt(np.maximum(evals, 0.0))
    fn = w/(2*np.pi)
    if n == 1:
        alpha = 2*zeta*w[0]
        beta = 0.0
    else:
        w1,w2=w[0],w[1]
        AA=np.array([[1/(2*w1),w1/2],[1/(2*w2),w2/2]],float)
        alpha,beta=np.linalg.solve(AA,np.array([zeta,zeta]))
    C = alpha*M + beta*K
    return Building(M=M,K=K,C=C,n=n,influence=np.ones(n),fn=fn)

def device_incidence_vector(n, story):
    if story < 1 or story > n or int(story)!=story:
        raise ValueError('story must be integer 1..n')
    q=np.zeros(n)
    q[int(story)-1]=1.0
    if story>1:
        q[int(story)-2]=-1.0
    return q

def interstory_drift(u, story_heights):
    u=np.asarray(u,float)
    h=np.asarray(story_heights,float).reshape(-1)
    rel=np.column_stack([u[:,0],np.diff(u,axis=1)])
    return rel/h

def mdof_ifd_response(t, ag, S: Building, p, story, story_heights, rtol=2e-6, atol=1e-8):
    t=np.asarray(t,float).reshape(-1)
    ag=np.asarray(ag,float).reshape(-1)
    q=device_incidence_vector(S.n,int(story))
    Me=S.M + float(p['b'])*np.outer(q,q)
    if np.linalg.cond(Me) > 1e12:
        raise ValueError('ill-conditioned effective mass')
    invMe=np.linalg.inv(Me)
    v0=max(float(p.get('v0',1e-3)), np.finfo(float).eps)
    c=float(p.get('c',0.0)); Fc=float(p.get('Fc',0.0)); k0=float(p.get('k0',0.0))
    def agfun(tt):
        return np.interp(tt,t,ag,left=0.0,right=0.0)
    def rhs(tt,y):
        u=y[:S.n]; v=y[S.n:]
        xr=q@u; vr=q@v
        Fni=c*vr + Fc*np.tanh(vr/v0) + k0*xr
        udd=invMe @ (-S.C@v - S.K@u - q*Fni - S.M@S.influence*agfun(tt))
        return np.concatenate([v,udd])
    sol=solve_ivp(rhs,(t[0],t[-1]),np.zeros(2*S.n),t_eval=t,rtol=rtol,atol=atol,method='RK45')
    if not sol.success:
        raise RuntimeError(sol.message)
    u=sol.y[:S.n].T; v=sol.y[S.n:].T
    a_rel=np.empty_like(u)
    for i,tt in enumerate(sol.t):
        dy=rhs(tt,sol.y[:,i]); a_rel[i]=dy[S.n:]
    a_abs=a_rel + ag[:,None]
    xr=u@q; vr=v@q; ar=a_rel@q
    Fd=float(p['b'])*ar + c*vr + Fc*np.tanh(vr/v0) + k0*xr
    drift=interstory_drift(u,story_heights)
    force_diss=c*vr + Fc*np.tanh(vr/v0)
    Ediss=float(np.trapezoid(force_diss*vr,sol.t))
    return {'t':sol.t,'u':u,'v':v,'a_rel':a_rel,'a_abs':a_abs,'x_device':xr,'v_device':vr,'a_device_rel':ar,'device_force':Fd,'interstory_drift':drift,'max_drift':float(np.max(np.abs(drift))),'max_abs_acc':float(np.max(np.abs(a_abs))),'peak_device_force':float(np.max(np.abs(Fd))),'device_dissipated_energy':Ediss,'effective_mass':Me}

def synthetic_record(record_id, dt=0.01, duration=15.0, pga_g=0.30):
    t=np.arange(0.0,duration+0.5*dt,dt)
    if record_id=='SYN-A':
        raw=(np.sin(2*np.pi*1.05*t)+0.35*np.sin(2*np.pi*2.4*t+0.4))
    elif record_id=='SYN-B':
        raw=(np.sin(2*np.pi*0.72*t+0.8)+0.28*np.sin(2*np.pi*3.1*t))
    else:
        raw=(np.sin(2*np.pi*1.45*t+0.2)+0.25*np.sin(2*np.pi*4.0*t+1.1))
    env=(1-np.exp(-1.8*t))*np.exp(-0.09*t)
    raw=raw*env
    ag=raw/np.max(np.abs(raw))*pga_g*G
    return {'id':record_id,'t':t,'ag':ag}

def evaluate_suite(x,suite,S,story_heights,cfg):
    story=int(np.clip(np.rint(x[0]),1,S.n))
    p=dict(cfg['model']); p.update(b=max(0,x[1]),Fc=max(0,x[2]),c=max(0,x[3]))
    lim=cfg['optimization']; rw=cfg['suite'].get('robust_weight',0.25)
    drift=[]; acc=[]; force=[]; energy=[]
    for rec in suite:
        out=mdof_ifd_response(rec['t'],rec['ag'],S,p,story,story_heights)
        drift.append(out['max_drift']/lim['drift_limit'])
        acc.append(out['max_abs_acc']/lim['acc_ref'])
        force.append(out['peak_device_force']/lim['device_force_limit'])
        energy.append(out['device_dissipated_energy'])
    drift=np.array(drift);acc=np.array(acc);force=np.array(force)
    md=np.array([drift.mean(),acc.mean(),force.mean()])
    wd=np.array([drift.max(),acc.max(),force.max()])
    rb=p['b']/lim['b_ref']
    Jraw=(lim['w_drift']*(md[0]+rw*wd[0]) + lim['w_acc']*(md[1]+rw*wd[1]) + lim['w_force']*(md[2]+rw*wd[2]) + lim['w_inertance']*rb)
    viol=max(0,wd[0]-1)**2 + max(0,wd[2]-1)**2
    return {'Jraw':float(Jraw),'violation':float(viol),'story':story,'params':p,'mean_ratios':md,'worst_ratios':wd,'energy':np.array(energy),'drift_ratio':drift,'acc_ratio':acc,'force_ratio':force}

def default_config():
    return {'model':{'b':1500.,'c':2e3,'Fc':2.5e4,'v0':1e-3,'k0':0.0},'optimization':{'b_bounds':(0.,6000.),'Fc_bounds':(0.,1.5e5),'c_bounds':(0.,2e4),'drift_limit':0.02,'device_force_limit':4e5,'acc_ref':0.50*9.81,'b_ref':6000.,'w_drift':0.50,'w_acc':0.25,'w_force':0.15,'w_inertance':0.10,'penalty':100.0},'suite':{'robust_weight':0.25}}
