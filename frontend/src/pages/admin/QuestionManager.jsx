import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Plus, Trash2, Filter, Search, BookOpen, Zap,
  ChevronDown, X, CheckCircle2, AlertCircle, Clock,
  Database, Layers, Tag
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const DOMAINS = ['General Aptitude', 'Technical', 'Verbal Ability', 'Logical Reasoning', 'Data Interpretation'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const DIFFICULTY_STYLE = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-red-50 text-red-700 border-red-200',
};
const DOMAIN_STYLE = 'bg-blue-50 text-blue-700 border-blue-200';

const EMPTY_FORM = {
  question_text: '',
  topic: '',
  domain: 'General Aptitude',
  difficulty: 'Medium',
  optA: '', optB: '', optC: '', optD: '',
  correct_option: '',
};

// ─── Sub-components ────────────────────────────────────────────────────────────
const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${className}`}>
    {children}
  </span>
);

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-3 bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm`}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
      <p className="text-xs font-bold text-slate-400 mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
const QuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomain] = useState('');
  const [diffFilter, setDiff] = useState('');
  const [isModalOpen, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (domainFilter) params.set('domain', domainFilter);
      const res = await axios.get(`/api/admin/questions?${params}`);
      setQuestions(res.data.data || []);
    } catch {
      toast.error('Failed to load question bank.');
    } finally {
      setLoading(false);
    }
  }, [domainFilter]);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  // ── Filtered view ──────────────────────────────────────────────────────────
  const filtered = questions.filter(q => {
    const matchSearch = !search || q.question_text?.toLowerCase().includes(search.toLowerCase())
      || q.topic?.toLowerCase().includes(search.toLowerCase());
    const matchDiff = !diffFilter || q.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: questions.length,
    easy: questions.filter(q => q.difficulty === 'Easy').length,
    hard: questions.filter(q => q.difficulty === 'Hard').length,
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openModal = () => { setForm(EMPTY_FORM); setModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.correct_option) { toast.error('Please select the correct answer option.'); return; }
    setSubmitting(true);
    try {
      // Map form fields → backend model fields
      const payload = {
        question_text: form.question_text.trim(),
        topic: form.topic.trim() || form.domain,
        domain: form.domain,
        difficulty: form.difficulty,
        options: {
          A: form.optA.trim(),
          B: form.optB.trim(),
          C: form.optC.trim(),
          D: form.optD.trim(),
        },
        correct_option: form.correct_option,
      };
      await axios.post('/api/admin/questions', payload);
      toast.success('✅ Question added to bank successfully!');
      setModal(false);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this question from the bank?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/questions/${id}`);
      toast.success('Question removed.');
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch {
      toast.error('Delete failed. Please retry.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
              <BookOpen size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Content Forge</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm ml-14">
            Curate and manage the aptitude test question bank.
          </p>
        </div>
        <button
          id="add-question-btn"
          onClick={openModal}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/25 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Add Question
        </button>
      </div>

      {/* ── Stat Pills ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatPill icon={Database} label="Total Questions" value={stats.total} color="bg-blue-600" />
        <StatPill icon={CheckCircle2} label="Easy Questions" value={stats.easy} color="bg-emerald-600" />
        <StatPill icon={Zap} label="Hard Questions" value={stats.hard} color="bg-red-500" />
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white dark:bg-[#1f2028] border border-slate-200 dark:border-[#2e303a] rounded-2xl p-4 flex flex-wrap gap-3 items-center shadow-sm">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="question-search"
            type="text"
            placeholder="Search questions or topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Domain Filter */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl px-3 py-2.5 min-w-[180px]">
          <Layers size={15} className="text-slate-400 shrink-0" />
          <select
            id="domain-filter"
            value={domainFilter}
            onChange={e => setDomain(e.target.value)}
            className="bg-black text-sm font-bold text-slate-700 dark:text-slate-200 outline-none flex-1"
          >
            <option value="">All Domains</option>
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl px-3 py-2.5 min-w-[150px]">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            id="difficulty-filter"
            value={diffFilter}
            onChange={e => setDiff(e.target.value)}
            className="bg-black text-sm font-bold text-slate-700 dark:text-slate-200 outline-none flex-1"
          >
            <option value="">All Levels</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {(domainFilter || diffFilter || search) && (
          <button
            onClick={() => { setSearch(''); setDomain(''); setDiff(''); }}
            className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Question Grid ── */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-[#1f2028] rounded-2xl p-6 border border-slate-100 dark:border-[#2e303a] animate-pulse">
              <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-2/3 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map(j => <div key={j} className="h-3 bg-slate-100 dark:bg-slate-700 rounded" />)}
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#1f2028] rounded-3xl border border-dashed border-slate-200 dark:border-[#2e303a]">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-700 dark:text-slate-200">No Questions Found</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            {questions.length === 0
              ? 'The question bank is empty. Add your first question to get started.'
              : 'No questions match your current filters. Try broadening your search.'}
          </p>
          {questions.length === 0 && (
            <button onClick={openModal} className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
              <Plus size={16} /> Add First Question
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {/* Results count */}
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Showing {filtered.length} of {questions.length} questions
          </p>
          {filtered.map((q, idx) => {
            const opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || {});
            return (
              <div
                key={q.id}
                className="bg-white dark:bg-[#1f2028] rounded-2xl border border-slate-100 dark:border-[#2e303a] p-6 flex gap-5 items-start group hover:border-blue-200 dark:hover:border-blue-900/50 hover:shadow-lg hover:shadow-blue-50 dark:hover:shadow-black/20 transition-all duration-200"
              >
                {/* Index */}
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] flex items-center justify-center text-xs font-black text-slate-500 dark:text-slate-400 shrink-0">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className={DOMAIN_STYLE}><Tag size={9} /> {q.domain}</Badge>
                    <Badge className={DIFFICULTY_STYLE[q.difficulty] || 'bg-slate-50 text-slate-600 border-slate-200'}>
                      {q.difficulty === 'Easy' && <CheckCircle2 size={9} />}
                      {q.difficulty === 'Medium' && <Clock size={9} />}
                      {q.difficulty === 'Hard' && <AlertCircle size={9} />}
                      {q.difficulty}
                    </Badge>
                    {q.topic && q.topic !== q.domain && (
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                        {q.topic}
                      </Badge>
                    )}
                  </div>

                  {/* Question text */}
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug mb-4">
                    {q.question_text}
                  </p>

                  {/* Options grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const isCorrect = q.correct_option === opt;
                      return (
                        <div
                          key={opt}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold'
                            : 'bg-slate-50 dark:bg-[#16171d] border border-slate-100 dark:border-[#2e303a] text-slate-600 dark:text-slate-400'
                            }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            }`}>{opt}</span>
                          <span className="truncate">{opts[opt] || '—'}</span>
                          {isCorrect && <CheckCircle2 size={13} className="text-emerald-500 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  id={`delete-q-${q.id}`}
                  onClick={() => handleDelete(q.id)}
                  disabled={deletingId === q.id}
                  className="p-2.5 rounded-xl text-slate-300 dark:text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0"
                >
                  {deletingId === q.id
                    ? <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    : <Trash2 size={18} />
                  }
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ ADD QUESTION MODAL ══════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="bg-white dark:bg-[#1f2028] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-[#2e303a] sticky top-0 bg-white dark:bg-[#1f2028] z-10 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Plus size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-none">New Question</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Add to the aptitude question bank</p>
                </div>
              </div>
              <button onClick={() => setModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1">

              {/* Question text */}
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  id="question-text-input"
                  placeholder="Enter the full question here..."
                  rows={3}
                  value={form.question_text}
                  onChange={e => setForm({ ...form, question_text: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 resize-none placeholder:text-slate-400 transition"
                />
              </div>

              {/* Domain + Difficulty + Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Domain</label>
                  <select
                    id="question-domain"
                    value={form.domain}
                    onChange={e => setForm({ ...form, domain: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Difficulty</label>
                  <select
                    id="question-difficulty"
                    value={form.difficulty}
                    onChange={e => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Topic (optional)</label>
                  <input
                    id="question-topic"
                    type="text"
                    placeholder="e.g., Probability"
                    value={form.topic}
                    onChange={e => setForm({ ...form, topic: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-slate-400 transition"
                  />
                </div>
              </div>

              {/* Options A–D */}
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                  Answer Options <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map(opt => {
                    const key = `opt${opt}`;
                    const isSelected = form.correct_option === opt;
                    return (
                      <div key={opt} className={`relative rounded-xl border transition-all ${isSelected ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-slate-200 dark:border-[#2e303a]'}`}>
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>{opt}</div>
                        <input
                          required
                          id={`option-${opt}`}
                          type="text"
                          placeholder={`Option ${opt}`}
                          value={form[key]}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#16171d] rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400 transition"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Correct answer selector */}
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      id={`correct-${opt}`}
                      onClick={() => setForm({ ...form, correct_option: opt })}
                      className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-200 ${form.correct_option === opt
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                        : 'bg-slate-50 dark:bg-[#16171d] border border-slate-200 dark:border-[#2e303a] text-slate-600 dark:text-slate-400 hover:border-emerald-300 hover:text-emerald-600'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-[#2e303a] rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-question-btn"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting
                    ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                    : <><CheckCircle2 size={16} /> Add to Bank</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
