/* global ethers */
"use strict";

const SEPOLIA_CHAIN_ID = 11155111n;
const SEPOLIA_CHAIN_HEX = "0xaa36a7";
const ADDRESS_STORAGE_KEY = "bhb-sepolia-contract";
const EXPLORER_BASE = "https://sepolia.etherscan.io";

const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address recipient, uint256 amount) returns (bool)",
  "function burn(uint256 amount)",
  "function cap() view returns (uint256)",
  "function remainingMintAllowance() view returns (uint256)",
  "function additionalMinted() view returns (uint256)",
  "function owner() view returns (address)",
  "function pendingOwner() view returns (address)",
  "function paused() view returns (bool)",
  "function mint(address recipient, uint256 amount)",
  "function pause()",
  "function unpause()",
  "function transferOwnership(address newOwner)",
  "function acceptOwnership()",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event AdditionalTokensMinted(address indexed recipient, uint256 amount, uint256 cumulativeAdditionalMinted)",
];

const state = {
  provider: null,
  signer: null,
  account: null,
  contract: null,
  contractAddress: null,
  decimals: 18,
  owner: null,
  pendingOwner: null,
  paused: false,
};

const $ = (id) => document.getElementById(id);

function shortAddress(address) {
  if (!address || address.length < 12) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function normalizeAddress(address) {
  return ethers.getAddress(String(address).trim());
}

function formatToken(value) {
  const raw = ethers.formatUnits(value, state.decimals);
  const [integer, fraction = ""] = raw.split(".");
  const grouped = Number(integer).toLocaleString("fa-IR");
  const trimmed = fraction.slice(0, 4).replace(/0+$/, "");
  return trimmed ? `${grouped}.${trimmed}` : grouped;
}

function parseToken(value) {
  const normalized = String(value).trim();
  if (!normalized || Number(normalized) <= 0) {
    throw new Error("مقدار توکن باید بزرگ‌تر از صفر باشد.");
  }
  return ethers.parseUnits(normalized, state.decimals);
}

function resolveError(error) {
  if (error?.code === 4001 || error?.code === "ACTION_REJECTED") {
    return "عملیات در کیف پول رد شد.";
  }
  const message = error?.shortMessage || error?.reason || error?.message || "خطای ناشناخته";
  if (message.includes("EnforcedPause")) return "قرارداد در حالت توقف اضطراری است.";
  if (message.includes("OwnableUnauthorizedAccount")) return "این عملیات فقط برای مالک قرارداد مجاز است.";
  if (message.includes("AdditionalMintAllowanceExceeded")) return "مقدار صدور از سهمیه باقی‌مانده بیشتر است.";
  if (message.includes("ERC20InsufficientBalance")) return "موجودی BHB کافی نیست.";
  return message.length > 180 ? `${message.slice(0, 177)}…` : message;
}

function toast(message, timeout = 5000) {
  const element = $("toast");
  element.textContent = message;
  element.classList.remove("hidden");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => element.classList.add("hidden"), timeout);
}

function addLog(message, type = "info", transactionHash = null) {
  const list = $("transactionLog");
  const item = document.createElement("li");
  const dot = document.createElement("span");
  dot.className = `log-dot ${type}`;
  const text = document.createElement("span");
  text.textContent = message;
  item.append(dot, text);

  if (transactionHash) {
    const link = document.createElement("a");
    link.href = `${EXPLORER_BASE}/tx/${transactionHash}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = transactionHash;
    item.append(link);
  }

  list.prepend(item);
  while (list.children.length > 7) list.lastElementChild.remove();
}

function updateWalletUi() {
  const connected = Boolean(state.account);
  $("connectionStatus").textContent = connected ? "کیف پول متصل است" : "کیف پول متصل نیست";
  $("accountLabel").textContent = connected ? shortAddress(state.account) : "—";
  document.querySelector(".status-dot").classList.toggle("connected", connected);
  $("connectButton").textContent = connected ? shortAddress(state.account) : "اتصال کیف پول";
}

function updateRoleUi() {
  const account = state.account?.toLowerCase();
  const isOwner = Boolean(account && state.owner?.toLowerCase() === account);
  const isPendingOwner = Boolean(account && state.pendingOwner?.toLowerCase() === account);
  document.querySelectorAll(".owner-only").forEach((element) => element.classList.toggle("hidden", !isOwner));
  $("acceptOwnershipCard").classList.toggle("hidden", !isPendingOwner);
  $("pauseButton").disabled = state.paused;
  $("unpauseButton").disabled = !state.paused;
  $("pauseDescription").textContent = state.paused
    ? "قرارداد متوقف است؛ انتقال، صدور و سوزاندن انجام نمی‌شود."
    : "قرارداد فعال است و عملیات توکن مجاز است.";
}

async function ensureSepolia() {
  const current = await window.ethereum.request({ method: "eth_chainId" });
  if (BigInt(current) === SEPOLIA_CHAIN_ID) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_HEX }],
    });
  } catch (error) {
    throw new Error(
      error?.code === 4902
        ? "شبکه Sepolia در کیف پول موجود نیست؛ نمایش شبکه‌های آزمایشی را در تنظیمات کیف پول فعال کنید."
        : "برای ادامه، تغییر شبکه به Sepolia را در کیف پول تأیید کنید.",
    );
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    $("walletWarning").classList.remove("hidden");
    throw new Error("کیف پول سازگار با Ethereum شناسایی نشد.");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  await ensureSepolia();
  state.provider = new ethers.BrowserProvider(window.ethereum, "any");
  state.signer = await state.provider.getSigner();
  state.account = await state.signer.getAddress();
  $("networkPill").textContent = "شبکه: Sepolia";
  $("networkPill").className = "pill pill-success";
  updateWalletUi();
  addLog(`کیف پول ${shortAddress(state.account)} متصل شد.`, "success");
}

async function loadContract(rawAddress) {
  if (!state.provider || !state.signer) {
    await connectWallet();
  }

  const address = normalizeAddress(rawAddress);
  const code = await state.provider.getCode(address);
  if (code === "0x") throw new Error("در این آدرس روی Sepolia قرارداد هوشمندی یافت نشد.");

  state.contractAddress = address;
  state.contract = new ethers.Contract(address, TOKEN_ABI, state.signer);

  const name = await state.contract.name();
  const symbol = await state.contract.symbol();
  if (name !== "BHB Engineering Token" || symbol !== "BHB") {
    state.contract = null;
    throw new Error("قرارداد این آدرس، BHB Engineering Token معتبر نیست.");
  }

  localStorage.setItem(ADDRESS_STORAGE_KEY, address);
  $("contractAddress").value = address;
  $("contractMessage").textContent = `قرارداد معتبر ${name} شناسایی شد.`;
  $("explorerLink").href = `${EXPLORER_BASE}/address/${address}`;
  $("explorerLink").classList.remove("disabled");
  addLog(`قرارداد ${shortAddress(address)} بررسی و فعال شد.`, "success");
  await refreshData();
}

async function refreshData() {
  if (!state.contract || !state.account) return;

  const [decimals, balance, totalSupply, cap, allowance, owner, pendingOwner, paused] = await Promise.all([
    state.contract.decimals(),
    state.contract.balanceOf(state.account),
    state.contract.totalSupply(),
    state.contract.cap(),
    state.contract.remainingMintAllowance(),
    state.contract.owner(),
    state.contract.pendingOwner(),
    state.contract.paused(),
  ]);

  state.decimals = Number(decimals);
  state.owner = owner;
  state.pendingOwner = pendingOwner;
  state.paused = paused;
  $("walletBalance").textContent = formatToken(balance);
  $("totalSupply").textContent = formatToken(totalSupply);
  $("supplyCap").textContent = formatToken(cap);
  $("mintAllowance").textContent = formatToken(allowance);
  updateRoleUi();
}

function requireContract() {
  if (!state.contract) throw new Error("ابتدا کیف پول و آدرس قرارداد را متصل کنید.");
  return state.contract;
}

async function runTransaction(description, transactionFactory) {
  try {
    const contract = requireContract();
    const transaction = await transactionFactory(contract);
    addLog(`${description} ارسال شد و منتظر تأیید شبکه است.`, "info", transaction.hash);
    toast("تراکنش ارسال شد؛ منتظر تأیید Sepolia باشید.");
    await transaction.wait();
    addLog(`${description} با موفقیت تأیید شد.`, "success", transaction.hash);
    toast("تراکنش با موفقیت تأیید شد.");
    await refreshData();
    return true;
  } catch (error) {
    const message = resolveError(error);
    addLog(message, "error");
    toast(message, 7000);
    return false;
  }
}

async function loadSavedDeployment() {
  let saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
  if (!saved) {
    try {
      const response = await fetch("deployment.json", { cache: "no-store" });
      if (response.ok) {
        const deployment = await response.json();
        if (deployment.chainId === Number(SEPOLIA_CHAIN_ID) && ethers.isAddress(deployment.address || "")) {
          saved = deployment.address;
        }
      }
    } catch {
      // The dashboard is still usable with manual contract entry.
    }
  }
  if (saved) $("contractAddress").value = saved;
}

function bindEvents() {
  $("connectButton").addEventListener("click", async () => {
    try {
      await connectWallet();
      if ($("contractAddress").value.trim()) await loadContract($("contractAddress").value);
    } catch (error) {
      toast(resolveError(error), 7000);
    }
  });

  $("contractForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try { await loadContract($("contractAddress").value); } catch (error) {
      const message = resolveError(error);
      $("contractMessage").textContent = message;
      addLog(message, "error");
      toast(message, 7000);
    }
  });

  $("transferForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const recipient = normalizeAddress($("transferRecipient").value);
      const amount = parseToken($("transferAmount").value);
      if (await runTransaction("انتقال BHB", (contract) => contract.transfer(recipient, amount))) event.target.reset();
    } catch (error) {
      toast(resolveError(error), 7000);
    }
  });

  $("burnForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const amount = parseToken($("burnAmount").value);
      if (await runTransaction("سوزاندن BHB", (contract) => contract.burn(amount))) event.target.reset();
    } catch (error) {
      toast(resolveError(error), 7000);
    }
  });

  $("mintForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const recipient = normalizeAddress($("mintRecipient").value);
      const amount = parseToken($("mintAmount").value);
      if (await runTransaction("صدور محدود BHB", (contract) => contract.mint(recipient, amount))) event.target.reset();
    } catch (error) {
      toast(resolveError(error), 7000);
    }
  });

  $("ownershipForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const newOwner = normalizeAddress($("newOwner").value);
      if (await runTransaction("شروع انتقال مالکیت", (contract) => contract.transferOwnership(newOwner))) event.target.reset();
    } catch (error) {
      toast(resolveError(error), 7000);
    }
  });

  $("pauseButton").addEventListener("click", () => runTransaction("توقف اضطراری", (contract) => contract.pause()));
  $("unpauseButton").addEventListener("click", () => runTransaction("رفع توقف اضطراری", (contract) => contract.unpause()));
  $("acceptOwnershipButton").addEventListener("click", () => runTransaction("پذیرش مالکیت", (contract) => contract.acceptOwnership()));
  $("refreshButton").addEventListener("click", async () => {
    try { await refreshData(); toast("اطلاعات به‌روزرسانی شد."); } catch (error) { toast(resolveError(error)); }
  });

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", () => window.location.reload());
    window.ethereum.on("chainChanged", () => window.location.reload());
  }
}

async function initialize() {
  bindEvents();
  await loadSavedDeployment();
  if (!window.ethereum) $("walletWarning").classList.remove("hidden");
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => undefined);
  }
}

window.addEventListener("DOMContentLoaded", initialize);
