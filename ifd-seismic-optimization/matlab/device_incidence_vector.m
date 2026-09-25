function q=device_incidence_vector(n,story)
if story<1||story>n||story~=round(story),error('story must be integer 1..n');end
q=zeros(n,1);q(story)=1;if story>1,q(story-1)=-1;end
end
