import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Trash, Filter } from 'lucide-react';

const QuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    questionText: '',
    optionA: '', optionB: '', optionC: '', optionD: '',
    correctOption: '',
    domain: 'General Aptitude',
    difficulty: 'Medium'
  });

  const fetchQs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/questions?domain=${domainFilter}`);
      setQuestions(res.data.data);
    } catch (e) {
      toast.error('Storage query failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQs(); }, [domainFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/questions', form);
      toast.success('New question injected successfully');
      setIsModalOpen(false);
      setForm({ questionText: '', optionA:'', optionB:'', optionC:'', optionD:'', correctOption:'', domain:'General Aptitude', difficulty:'Medium' });
      fetchQs();
    } catch (err) {
      toast.error('Data write collision/error');
    }
  };

  const handleDelete = async (id) => {
    if(!confirm('Permanently erase this data point?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/questions/${id}`);
      fetchQs();
    } catch(e) { toast.error('Erase failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Question Repository</h1>
          <p className="text-sm text-slate-500">Curate the Aptitude test engine dataset bank.</p>
        </div>
        <button 
          onClick={()=>setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus size={18} /> Inject Entry
        </button>
      </div>

      <div className="flex gap-3 items-center bg-white p-4 rounded-xl border border-slate-200">
        <Filter size={18} className="text-slate-400" />
        <select 
          className="bg-transparent font-bold text-sm text-slate-700 outline-none"
          value={domainFilter}
          onChange={(e)=>setDomainFilter(e.target.value)}
        >
          <option value="">All System Domains</option>
          <option value="General Aptitude">General Aptitude</option>
          <option value="Technical">Technical Concepts</option>
          <option value="Verbal Ability">Verbal Ability</option>
        </select>
      </div>

      <div className="grid gap-4">
        {loading ? <p className="italic text-slate-400">Scanning index sector...</p> :
         questions.map(q => (
           <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex justify-between items-start group hover:border-blue-200 hover:shadow-md transition-all">
             <div className="flex-1">
               <div className="flex gap-2 mb-2">
                 <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{q.domain}</span>
                 <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                   q.difficulty === 'Hard' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                 }`}>{q.difficulty}</span>
               </div>
               <p className="font-bold text-slate-800 text-lg leading-tight mb-4">{q.questionText}</p>
               <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className={q.correctOption==='A'?'text-green-600 font-bold':'text-slate-500'}>A) {q.optionA}</div>
                  <div className={q.correctOption==='B'?'text-green-600 font-bold':'text-slate-500'}>B) {q.optionB}</div>
                  <div className={q.correctOption==='C'?'text-green-600 font-bold':'text-slate-500'}>C) {q.optionC}</div>
                  <div className={q.correctOption==='D'?'text-green-600 font-bold':'text-slate-500'}>D) {q.optionD}</div>
               </div>
             </div>
             <button onClick={()=>handleDelete(q.id)} className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 p-2 bg-slate-50 rounded-lg transition-all ml-4">
               <Trash size={18} />
             </button>
           </div>
         ))
        }
      </div>

      {/* INJECTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
            <h2 className="text-xl font-black mb-6 border-b pb-4 text-slate-800">Injection Interface</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-2">Prompt/Query Text</label>
                <textarea required className="w-full p-3 border rounded-xl bg-slate-50 outline-none resize-none h-24 focus:bg-white focus:ring-2" 
                  value={form.questionText} onChange={(e)=>setForm({...form, questionText:e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['A','B','C','D'].map(opt => (
                  <div key={opt}>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Option {opt}</label>
                    <input required className="w-full p-2.5 border rounded-xl bg-slate-50 focus:bg-white" 
                      value={form[`option${opt}`]} onChange={(e)=>setForm({...form, [`option${opt}`]:e.target.value})}/>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Correct Vector</label>
                  <select required className="w-full p-2.5 border rounded-xl" value={form.correctOption} onChange={(e)=>setForm({...form, correctOption:e.target.value})}>
                    <option value="">-</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subject Map</label>
                  <select className="w-full p-2.5 border rounded-xl" value={form.domain} onChange={(e)=>setForm({...form, domain:e.target.value})}>
                    <option value="General Aptitude">General Aptitude</option>
                    <option value="Technical">Technical</option>
                    <option value="Verbal Ability">Verbal Ability</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Severity Level</label>
                  <select className="w-full p-2.5 border rounded-xl" value={form.difficulty} onChange={(e)=>setForm({...form, difficulty:e.target.value})}>
                    <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={()=>setIsModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Abort</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700">Commit to Database</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
