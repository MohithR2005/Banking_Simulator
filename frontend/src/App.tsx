import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, BadgeIndianRupee, Building2, ChevronRight,
  Copy, CreditCard, Landmark, LogOut, Plus, RefreshCw, Search, Send, ShieldCheck, Sparkles,
  Trash2, UserPlus, X,
} from "lucide-react";
import { PaperShaderBackground } from "@/components/ui/background-paper-shaders";
import NeuralBackground from "@/components/ui/flow-field-background";
import {
  Account, api, AuditLog, Beneficiary, BeneficiaryLookup, FraudFlag,
  money, Session, shortAccount, Transaction,
} from "@/lib/api";

const sessionKey = "bankingSession";
const field = "h-12 w-full rounded-xl border border-white/10 bg-white/[.055] px-4 text-sm text-white outline-none transition focus:border-emerald-400/60 focus:bg-white/[.08]";

function getSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(sessionKey) || "null"); } catch { return null; }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(getSession);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3500); };
  const logout = () => {
    localStorage.removeItem(sessionKey);
    setSession(null);
    setAccounts([]);
    setTransactions([]);
  };
  const loadAccounts = async () => {
    if (!session) return;
    try { setAccounts(await api<Account[]>("/api/accounts", session)); }
    catch { logout(); }
  };

  useEffect(() => { loadAccounts(); }, [session]);

  const authenticate = async (path: string, payload: object) => {
    setBusy(true);
    try {
      const next = await api<Session>(path, null, { method: "POST", body: JSON.stringify(payload) });
      localStorage.setItem(sessionKey, JSON.stringify(next));
      setSession(next);
      notify(path.endsWith("register") ? "Your profile is ready" : "Welcome back");
    } catch (error) { notify((error as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {session ? (
        <Dashboard
          session={session}
          accounts={accounts}
          transactions={transactions}
          setTransactions={setTransactions}
          refresh={loadAccounts}
          logout={logout}
          notify={notify}
        />
      ) : <Auth onAuthenticate={authenticate} busy={busy} />}
      <AnimatePresence>{notice && <Toast message={notice} />}</AnimatePresence>
    </div>
  );
}

function Auth({ onAuthenticate, busy }: { onAuthenticate: (path: string, payload: object) => void; busy: boolean }) {
  const [register, setRegister] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAuthenticate(`/api/auth/${register ? "register" : "login"}`, Object.fromEntries(new FormData(event.currentTarget)));
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <PaperShaderBackground className="absolute inset-0" intensity={1.2} speed={1} />
      <div className="absolute inset-0 bg-[#070b14]/35" />
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <Brand />
        <span className="hidden items-center gap-2 text-xs text-slate-400 sm:flex"><ShieldCheck size={15} className="text-emerald-400" /> Protected with bank-grade security</span>
      </nav>
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-100px)] max-w-7xl items-center gap-14 px-6 pb-16 lg:grid-cols-[1.08fr_.72fr] lg:px-10">
        <section>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[.07] px-4 py-2 text-xs text-emerald-200">
            <Sparkles size={14} /> Banking built around your life
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-[-.055em] sm:text-6xl lg:text-[5.4rem]">
            Money moves.<br /><span className="text-gradient">You move forward.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            One clear place to save, spend, transfer, and understand your money. Fast when you need it, calm when you do not.
          </p>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
            {["Instant transfers", "Real-time insights", "Always protected"].map((item) => (
              <span key={item} className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-400" />{item}</span>
            ))}
          </div>
        </section>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto w-full max-w-md rounded-[2rem] p-7 sm:p-9">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-400">{register ? "Join BlackRock Banking" : "Welcome back"}</p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight">{register ? "Create your account" : "Sign in to your bank"}</h2>
            <p className="mt-2 text-sm text-slate-400">{register ? "It only takes a minute." : "Your financial home is ready."}</p>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            {register && <input className={field} name="fullName" placeholder="Full name" required />}
            <input className={field} name="email" type="email" placeholder="Email address" required />
            <input className={field} name="password" type="password" placeholder="Password" minLength={8} required />
            <button disabled={busy} className="primary-button mt-2 h-12 w-full rounded-xl">{busy ? "Please wait..." : register ? "Create account" : "Continue"}<ArrowRight size={17} /></button>
          </form>
          <button onClick={() => setRegister(!register)} className="mt-6 w-full text-center text-sm text-slate-400 hover:text-white">
            {register ? "Already bank with us? Sign in" : "New here? Create an account"}
          </button>
        </motion.section>
      </div>
    </main>
  );
}

function Dashboard({ session, accounts, transactions, setTransactions, refresh, logout, notify }: {
  session: Session; accounts: Account[]; transactions: Transaction[]; setTransactions: (value: Transaction[]) => void;
  refresh: () => Promise<void>; logout: () => void; notify: (message: string) => void;
}) {
  const [action, setAction] = useState<"deposit" | "withdraw" | "transfer" | null>(null);
  const [accountTypeToCreate, setAccountTypeToCreate] = useState<Account["accountType"] | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [adminData, setAdminData] = useState<(FraudFlag | AuditLog)[]>([]);
  const total = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance), 0), [accounts]);

  const loadBeneficiaries = async () => setBeneficiaries(await api<Beneficiary[]>("/api/beneficiaries", session));
  const refreshAll = async () => { await refresh(); await loadBeneficiaries(); };
  const run = async (promise: Promise<unknown>, message: string) => {
    try { await promise; await refreshAll(); notify(message); setAction(null); }
    catch (error) { notify((error as Error).message); }
  };
  const createAccount = async (accountType: Account["accountType"], transactionPin: string) => {
    try {
      await api("/api/accounts", session, { method: "POST", body: JSON.stringify({ accountType, transactionPin }) });
      await refreshAll();
      notify(`${accountType[0]}${accountType.slice(1).toLowerCase()} account created`);
      setAccountTypeToCreate(null);
    } catch (error) {
      notify((error as Error).message);
    }
  };
  const loadTransactions = async (id = accounts[0]?.id) => {
    if (id) setTransactions(await api<Transaction[]>(`/api/transactions/account/${id}`, session));
  };

  useEffect(() => { loadBeneficiaries().catch((error) => notify((error as Error).message)); }, []);
  useEffect(() => { if (accounts.length) loadTransactions(); }, [accounts.length]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeuralBackground className="fixed inset-0" color="#7fffd4" trailOpacity={0.08} particleCount={700} speed={0.65} />
      <div className="fixed inset-0 bg-[#070b14]/58" />
      <header className="sticky top-0 z-30 border-b border-white/[.07] bg-[#070b14]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Brand />
          <nav className="hidden gap-1 md:flex">
            {["overview", "accounts", "beneficiaries", "activity"].map((item) => <span key={item} className="nav-link">{item}</span>)}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={refreshAll} className="icon-button"><RefreshCw size={16} /></button>
            <button onClick={logout} className="hidden items-center gap-2 text-sm text-slate-400 hover:text-white sm:flex"><LogOut size={16} /> Sign out</button>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-9 lg:px-8 lg:py-12">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="eyebrow">Personal banking</p><h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">Good day, {session.fullName || session.email.split("@")[0]}</h1></div>
          <ServicePromise />
        </div>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <div className="balance-card relative overflow-hidden rounded-[1.75rem] p-7 sm:p-9">
            <div className="relative">
              <div className="flex items-center justify-between"><p className="text-sm text-emerald-50/70">Total balance</p><Landmark size={20} className="text-emerald-100/70" /></div>
              <p className="mt-5 text-4xl font-medium tracking-[-.04em] sm:text-6xl">{money(total)}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <button onClick={() => setAction("deposit")} className="soft-button"><ArrowDownLeft size={16} /> Add money</button>
                <button onClick={() => setAction("withdraw")} className="soft-button"><ArrowUpRight size={16} /> Withdraw</button>
                <button onClick={() => setAction("transfer")} className="soft-button"><Send size={16} /> Transfer</button>
              </div>
            </div>
          </div>
          <div className="panel rounded-[1.75rem] p-7">
            <div className="flex items-center justify-between">
              <div><p className="eyebrow">Snapshot</p><h2 className="mt-2 text-xl">Your accounts</h2></div>
              <button onClick={() => setAccountTypeToCreate("SAVINGS")} className="icon-button"><Plus size={17} /></button>
            </div>
            <div className="mt-7 space-y-5">
              {accounts.length ? accounts.slice(0, 3).map((account) => <AccountLine key={account.id} account={account} notify={notify} />) : <Empty text="Create your first savings or current account to begin." />}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <div className="panel rounded-[1.75rem] p-7">
            <div className="flex items-center justify-between"><div><p className="eyebrow">Quick actions</p><h2 className="mt-2 text-xl">Move your money</h2></div><BadgeIndianRupee className="text-emerald-400" size={20} /></div>
            <div className="mt-7 grid gap-3">
              {[["deposit", "Add money", ArrowDownLeft], ["transfer", "Send to beneficiary", Send], ["withdraw", "Make a withdrawal", ArrowUpRight]].map(([id, label, Icon]) => (
                <button key={id as string} onClick={() => setAction(id as typeof action)} className="action-row"><span className="action-icon"><Icon size={17} /></span><span>{label as string}</span><ChevronRight size={16} className="ml-auto text-slate-600" /></button>
              ))}
            </div>
            <button onClick={() => setAccountTypeToCreate("CURRENT")} className="mt-4 w-full rounded-xl border border-dashed border-white/15 py-3 text-sm text-slate-400 hover:border-emerald-400/40 hover:text-white">+ Create current account</button>
          </div>
          <div className="panel rounded-[1.75rem] p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="eyebrow">Latest activity</p><h2 className="mt-2 text-xl">Transactions</h2></div>
              {accounts.length > 0 && <select className={`${field} !h-10 !w-auto`} onChange={(e) => loadTransactions(Number(e.target.value))}>{accounts.map((account) => <option className="bg-slate-900" key={account.id} value={account.id}>{account.accountType} {shortAccount(account.accountNumber)}</option>)}</select>}
            </div>
            <div className="mt-5 divide-y divide-white/[.07]">{transactions.length ? transactions.slice(0, 6).map((tx) => <TransactionLine key={tx.id} tx={tx} />) : <Empty text="Your recent activity will appear here." />}</div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
          <BeneficiaryManager session={session} beneficiaries={beneficiaries} reload={loadBeneficiaries} notify={notify} />
          <div className="panel rounded-[1.75rem] p-7">
            <div className="flex items-center justify-between"><div><p className="eyebrow">External transfers</p><h2 className="mt-2 text-xl">Saved recipients</h2></div><Send className="text-emerald-400" size={20} /></div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Users now transfer to another account holder through a verified beneficiary, not an internal database ID.
            </p>
            <div className="mt-6 grid gap-3">
              {beneficiaries.length ? beneficiaries.slice(0, 4).map((beneficiary) => <BeneficiaryLine key={beneficiary.id} beneficiary={beneficiary} />) : <Empty text="No beneficiaries yet. Add another user's account number to begin." />}
            </div>
          </div>
        </section>

        {session.role === "ADMIN" && <AdminPanel session={session} data={adminData} setData={setAdminData} notify={notify} />}
      </main>
      <AnimatePresence>
        {action && <ActionModal action={action} accounts={accounts} beneficiaries={beneficiaries} close={() => setAction(null)} run={run} session={session} />}
        {accountTypeToCreate && <CreateAccountModal accountType={accountTypeToCreate} close={() => setAccountTypeToCreate(null)} createAccount={createAccount} />}
      </AnimatePresence>
    </div>
  );
}

function ServicePromise() {
  const [wordIndex, setWordIndex] = useState(0);
  const words = useMemo(() => ["safe", "secure", "fast", "reliable"], []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setWordIndex((current) => (current + 1) % words.length), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [wordIndex, words.length]);

  return <div className="min-w-0 text-left sm:text-right">
    <p className="eyebrow">Our service is</p>
    <div className="mt-2 flex min-h-10 items-center overflow-hidden text-3xl font-medium tracking-tight sm:justify-end sm:text-4xl">
      <span className="sr-only">Our service is {words[wordIndex]}</span>
      <span aria-hidden="true" className="relative inline-flex h-10 min-w-[9.5rem] items-center justify-start overflow-hidden sm:justify-end">
        {words.map((word, index) => (
          <motion.span
            key={word}
            className="absolute text-emerald-300"
            initial={{ opacity: 0, y: 34 }}
            animate={wordIndex === index ? { opacity: 1, y: 0 } : { opacity: 0, y: wordIndex > index ? -34 : 34 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    </div>
  </div>;
}

function ActionModal({ action, accounts, beneficiaries, close, run, session }: {
  action: "deposit" | "withdraw" | "transfer"; accounts: Account[]; beneficiaries: Beneficiary[];
  close: () => void; run: (promise: Promise<unknown>, message: string) => void; session: Session;
}) {
  const [transferMode, setTransferMode] = useState<"own" | "beneficiary">("own");
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id ?? 0);
  const ownDestinationAccounts = accounts.filter((account) => account.id !== fromAccountId);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const description = String(values.description || "");
    const transactionPin = String(values.transactionPin || "");
    const payload = action === "transfer" && transferMode === "own"
      ? { fromAccountId: Number(values.accountId), toAccountId: Number(values.toAccountId), amount: Number(values.amount), description, transactionPin }
      : action === "transfer"
      ? { fromAccountId: Number(values.accountId), beneficiaryId: Number(values.beneficiaryId), amount: Number(values.amount), description, transactionPin }
      : action === "withdraw"
      ? { accountId: Number(values.accountId), amount: Number(values.amount), description, transactionPin }
      : { accountId: Number(values.accountId), amount: Number(values.amount), description };
    const path = action === "transfer" && transferMode === "own"
      ? "/api/transactions/transfer"
      : action === "transfer" ? "/api/transactions/beneficiary-transfer" : `/api/transactions/${action}`;
    run(api(path, session, { method: "POST", body: JSON.stringify(payload) }), `${action[0].toUpperCase() + action.slice(1)} complete`);
  };

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5 backdrop-blur-sm" onMouseDown={close}>
    <motion.form initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onSubmit={submit} onMouseDown={(e) => e.stopPropagation()} className="panel w-full max-w-md rounded-[1.75rem] p-7">
      <div className="flex items-start justify-between"><div><p className="eyebrow">Money movement</p><h2 className="mt-2 text-2xl capitalize">{action}</h2></div><button type="button" onClick={close} className="icon-button"><X size={17} /></button></div>
      <div className="mt-7 space-y-4">
        <label className="label">From account<select className={field} name="accountId" value={fromAccountId} onChange={(event) => setFromAccountId(Number(event.target.value))} required>{accounts.map((account) => <option className="bg-slate-900" key={account.id} value={account.id}>{account.accountType} - {shortAccount(account.accountNumber)} - {money(account.balance)}</option>)}</select></label>
        {action === "transfer" && <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[.035] p-1">
          <button type="button" onClick={() => setTransferMode("own")} className={`h-10 rounded-lg text-sm transition ${transferMode === "own" ? "bg-emerald-400 text-[#07130f]" : "text-slate-400 hover:text-white"}`}>My account</button>
          <button type="button" onClick={() => setTransferMode("beneficiary")} className={`h-10 rounded-lg text-sm transition ${transferMode === "beneficiary" ? "bg-emerald-400 text-[#07130f]" : "text-slate-400 hover:text-white"}`}>Beneficiary</button>
        </div>}
        {action === "transfer" && transferMode === "own" && <label className="label">To account<select className={field} name="toAccountId" required>{ownDestinationAccounts.map((account) => <option className="bg-slate-900" key={account.id} value={account.id}>{account.accountType} - {shortAccount(account.accountNumber)} - {money(account.balance)}</option>)}</select></label>}
        {action === "transfer" && transferMode === "own" && accounts.length < 2 && <p className="rounded-xl border border-amber-400/20 bg-amber-400/[.06] p-3 text-xs leading-5 text-amber-100">Create another account before transferring between your own accounts.</p>}
        {action === "transfer" && transferMode === "beneficiary" && <label className="label">Beneficiary<select className={field} name="beneficiaryId" required>{beneficiaries.map((beneficiary) => <option className="bg-slate-900" key={beneficiary.id} value={beneficiary.id}>{beneficiary.nickname} - {beneficiary.recipientName} - {beneficiary.maskedAccountNumber}</option>)}</select></label>}
        {action === "transfer" && transferMode === "beneficiary" && !beneficiaries.length && <p className="rounded-xl border border-amber-400/20 bg-amber-400/[.06] p-3 text-xs leading-5 text-amber-100">Add a beneficiary by account number before sending money to another account holder.</p>}
        <label className="label">Amount<input className={field} name="amount" type="number" min=".01" step=".01" placeholder="INR 0.00" required /></label>
        <label className="label">Note<input className={field} name="description" placeholder="Optional description" /></label>
        {action !== "deposit" && <label className="label">Transaction PIN<input className={field} name="transactionPin" type="password" inputMode="numeric" pattern="\d{4}|\d{6}" minLength={4} maxLength={6} placeholder="4 or 6 digit PIN" required /></label>}
        <button disabled={!accounts.length || (action === "transfer" && transferMode === "own" && accounts.length < 2) || (action === "transfer" && transferMode === "beneficiary" && !beneficiaries.length)} className="primary-button h-12 w-full rounded-xl capitalize">{action}<ArrowRight size={16} /></button>
      </div>
    </motion.form>
  </motion.div>;
}

function CreateAccountModal({ accountType, close, createAccount }: {
  accountType: Account["accountType"];
  close: () => void;
  createAccount: (accountType: Account["accountType"], transactionPin: string) => Promise<void>;
}) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    createAccount(accountType, String(values.transactionPin || ""));
  };

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5 backdrop-blur-sm" onMouseDown={close}>
    <motion.form initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onSubmit={submit} onMouseDown={(e) => e.stopPropagation()} className="panel w-full max-w-md rounded-[1.75rem] p-7">
      <div className="flex items-start justify-between">
        <div><p className="eyebrow">Secure account</p><h2 className="mt-2 text-2xl">Create {accountType.toLowerCase()} account</h2></div>
        <button type="button" onClick={close} className="icon-button"><X size={17} /></button>
      </div>
      <div className="mt-7 space-y-4">
        <label className="label">Set Transaction PIN<input className={field} name="transactionPin" type="password" inputMode="numeric" pattern="\d{4}|\d{6}" minLength={4} maxLength={6} placeholder="4 or 6 digit PIN" required /></label>
        <p className="rounded-xl border border-white/10 bg-white/[.035] p-3 text-xs leading-5 text-slate-400">This PIN is required for withdrawals and transfers. It is stored securely as a hash.</p>
        <button className="primary-button h-12 w-full rounded-xl">Create account<ArrowRight size={16} /></button>
      </div>
    </motion.form>
  </motion.div>;
}

function BeneficiaryManager({ session, beneficiaries, reload, notify }: { session: Session; beneficiaries: Beneficiary[]; reload: () => Promise<void>; notify: (message: string) => void }) {
  const [lookup, setLookup] = useState<BeneficiaryLookup | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [nickname, setNickname] = useState("");

  const findRecipient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await api<BeneficiaryLookup>("/api/beneficiaries/lookup", session, { method: "POST", body: JSON.stringify({ accountNumber }) });
      setLookup(result);
      setNickname(result.holderName);
      notify("Recipient verified");
    } catch (error) {
      setLookup(null);
      notify((error as Error).message);
    }
  };

  const addBeneficiary = async () => {
    if (!lookup) return;
    try {
      await api<Beneficiary>("/api/beneficiaries", session, { method: "POST", body: JSON.stringify({ accountNumber: lookup.accountNumber, nickname }) });
      setLookup(null);
      setAccountNumber("");
      setNickname("");
      await reload();
      notify("Beneficiary added");
    } catch (error) {
      notify((error as Error).message);
    }
  };

  const remove = async (id: number) => {
    try {
      await api<void>(`/api/beneficiaries/${id}`, session, { method: "DELETE" });
      await reload();
      notify("Beneficiary removed");
    } catch (error) {
      notify((error as Error).message);
    }
  };

  return <div className="panel rounded-[1.75rem] p-7">
    <div className="flex items-center justify-between"><div><p className="eyebrow">Beneficiaries</p><h2 className="mt-2 text-xl">Add by account number</h2></div><UserPlus className="text-emerald-400" size={20} /></div>
    <form onSubmit={findRecipient} className="mt-6 flex gap-3">
      <input className={field} value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} placeholder="Recipient account number" required />
      <button className="icon-button h-12 w-12 flex-none" aria-label="Verify account"><Search size={17} /></button>
    </form>
    {lookup && <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/[.06] p-4">
      <p className="text-sm font-medium">{lookup.holderName}</p>
      <p className="mt-1 text-xs text-slate-400">{lookup.accountType} account - {shortAccount(lookup.accountNumber)}</p>
      <label className="label mt-4">Nickname<input className={field} value={nickname} onChange={(event) => setNickname(event.target.value)} /></label>
      <button onClick={addBeneficiary} className="primary-button mt-4 h-11 w-full rounded-xl" type="button">Save beneficiary<ArrowRight size={16} /></button>
    </div>}
    <div className="mt-6 space-y-3">
      {beneficiaries.length ? beneficiaries.map((beneficiary) => <div key={beneficiary.id} className="flex items-center gap-3 rounded-xl border border-white/[.07] p-3">
        <BeneficiaryLine beneficiary={beneficiary} />
        <button onClick={() => remove(beneficiary.id)} className="icon-button ml-auto h-9 w-9" aria-label="Remove beneficiary"><Trash2 size={15} /></button>
      </div>) : <Empty text="Find another user's account number and save them here." />}
    </div>
  </div>;
}

function AdminPanel({ session, data, setData, notify }: { session: Session; data: (FraudFlag | AuditLog)[]; setData: (data: (FraudFlag | AuditLog)[]) => void; notify: (message: string) => void }) {
  const load = async (path: string) => { try { setData(await api(path, session)); } catch (error) { notify((error as Error).message); } };
  return <section className="panel mt-6 rounded-[1.75rem] p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">Administrator</p><h2 className="mt-2 text-xl">Security review</h2></div><div className="flex gap-2"><button onClick={() => load("/api/admin/fraud-flags")} className="soft-button">Fraud flags</button><button onClick={() => load("/api/admin/audit-logs")} className="soft-button">Audit logs</button></div></div><pre className="mt-5 max-h-72 overflow-auto rounded-xl bg-black/25 p-4 text-xs text-slate-400">{data.length ? JSON.stringify(data, null, 2) : "Choose a report to review."}</pre></section>;
}

function AccountLine({ account, notify }: { account: Account; notify: (message: string) => void }) {
  const copyAccountNumber = async () => {
    await navigator.clipboard.writeText(account.accountNumber);
    notify("Full account number copied");
  };

  return <div className="flex items-center gap-3">
    <span className="action-icon"><CreditCard size={17} /></span>
    <div>
      <p className="text-sm">{account.accountType}</p>
      <p className="mt-1 text-xs text-slate-500">{shortAccount(account.accountNumber)}</p>
    </div>
    <p className="ml-auto text-sm font-medium">{money(account.balance)}</p>
    <button onClick={copyAccountNumber} className="icon-button h-9 w-9" aria-label="Copy full account number" title="Copy full account number">
      <Copy size={14} />
    </button>
  </div>;
}
function BeneficiaryLine({ beneficiary }: { beneficiary: Beneficiary }) { return <div className="flex min-w-0 flex-1 items-center gap-3"><span className="action-icon"><UserPlus size={17} /></span><div className="min-w-0"><p className="truncate text-sm">{beneficiary.nickname}</p><p className="mt-1 truncate text-xs text-slate-500">{beneficiary.recipientName} - {beneficiary.accountType} - {beneficiary.maskedAccountNumber}</p></div></div>; }
function TransactionLine({ tx }: { tx: Transaction }) { const incoming = tx.type === "DEPOSIT"; return <div className="flex items-center gap-3 py-4"><span className="action-icon">{incoming ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}</span><div><p className="text-sm capitalize">{tx.description || tx.type.toLowerCase()}</p><p className="mt-1 text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} - {tx.status}</p></div><p className={`ml-auto text-sm font-medium ${incoming ? "text-emerald-400" : ""}`}>{incoming ? "+" : "-"}{money(tx.amount)}</p></div>; }
function Empty({ text }: { text: string }) { return <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">{text}</div>; }
function Brand() { return <div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-[#07130f]"><Building2 size={18} strokeWidth={2.5} /></span><span className="text-lg font-semibold tracking-[-.04em]">BlackRock Banking</span></div>; }
function Toast({ message }: { message: string }) { return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="fixed bottom-5 right-5 z-[60] rounded-xl border border-emerald-400/20 bg-[#101a19] px-5 py-4 text-sm shadow-2xl">{message}</motion.div>; }
