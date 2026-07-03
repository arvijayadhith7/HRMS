import {
    Briefcase,
    Calendar,
    Edit,
    Mail,
    Plus,
    Trash2,
    UserPlus,
    Users,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Recruitment() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedJobForCandidate, setSelectedJobForCandidate] = useState(null);
  const [jobFormData, setJobFormData] = useState({
    title: '', department: '', description: '', requirements: '', status: 'open' });

  const [candidateFormData, setCandidateFormData] = useState({
    jobId: null, firstName: '', lastName: '', email: '', phone: '', resumeUrl: '', notes: '', status: 'applied'
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/recruitment/jobs');
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleOpenJobModal = (job = null) => {
    setEditingJob(job);
    if (job) {
      setJobFormData({
        title: job.title,
        department: job.department,
        description: job.description,
        requirements: job.requirements,
        status: job.status
      });
    } else {
      setJobFormData({
        title: '', department: '', description: '', requirements: '', status: 'open'
      });
    }
    setShowJobModal(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await api.put(`/recruitment/jobs/${editingJob.id}`, jobFormData);
      } else {
        await api.post('/recruitment/jobs', jobFormData);
      }
      setShowJobModal(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!confirm('Are you sure you want to delete this job opening?')) return;
    try {
      await api.delete(`/recruitment/jobs/${id}`);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCandidateModal = (job) => {
    setSelectedJobForCandidate(job);
    setCandidateFormData({
      jobId: job.id, firstName: '', lastName: '', email: '', phone: '', resumeUrl: '', notes: '', status: 'applied'
    });
    setShowCandidateModal(true);
  };

  const handleSaveCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recruitment/candidates', candidateFormData);
      setShowCandidateModal(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'text-success bg-success/10 border-success';
      case 'closed': return 'text-danger bg-danger/10 border-danger';
      case 'on-hold': return 'text-warning bg-warning/10 border-warning';
      default: return 'text-secondary bg-secondary/10 border-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Recruitment</h2>
          <p className="text-xs text-secondary mt-1">Manage job openings and track candidates</p>
        </div>
        <button 
          onClick={() => handleOpenJobModal()} 
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white border border-border rounded-xl p-8 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-secondary/50 mb-4" />
          <h4 className="text-lg font-bold text-text-primary">No job openings yet</h4>
          <p className="text-sm text-secondary mt-2">Start by adding a new job posting to get going.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {jobs.map(job => (
          <div key={job.id} className="bg-white border border-border rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-semibold text-text-primary">{job.title}</h3>
                <p className="text-xs text-secondary">{job.department}</p>
              </div>
              <span className={`px-3 py-1 border rounded-full text-xs font-semibold capitalize ${getStatusColor(job.status)}`}>{job.status}</span>
            </div>

            <p className="text-sm text-secondary mb-4">{job.description}</p>
            <div className="flex gap-3 items-center mb-4">
              <div className="flex items-center gap-1.5 text-xs text-secondary">
                <Users className="w-3 h-3" />
                <span>{job.candidates?.length || 0} candidates</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-secondary">
                <Calendar className="w-3 h-3" />
                <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleOpenJobModal(job)} className="p-1.5 text-secondary hover:text-primary hover:bg-background rounded transition-colors"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleOpenCandidateModal(job)} className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> Add Candidate
              </button>
              <button onClick={() => handleDeleteJob(job.id)} className="p-1.5 text-secondary hover:text-danger hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>

            {job.candidates && job.candidates.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-secondary mb-2">Candidates:</p>
                <div className="space-y-2">
                  {job.candidates.slice(0, 3).map(candidate => (
                    <div key={candidate.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-text-primary font-medium">{candidate.firstName} {candidate.lastName}</p>
                        <p className="text-xs text-secondary flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {candidate.email}
                        </p>
                      </div>
                      <span className="text-xs font-semibold capitalize">{candidate.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {showJobModal && (
        <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border bg-white">
              <h4 className="text-lg font-bold text-text-primary">{editingJob ? 'Edit Job' : 'Create Job'}</h4>
              <button onClick={() => setShowJobModal(false)} className="p-1.5 text-secondary hover:bg-background rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveJob} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-secondary mb-2">Title</label>
                  <input 
                    type="text" required className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm focus:border-primary" 
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Department</label>
                  <input 
                    type="text" required className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm focus:border-primary"
                    value={jobFormData.department} onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Status</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm"
                    value={jobFormData.status} onChange={(e) => setJobFormData({ ...jobFormData, status: e.target.value })}
                  >
                    <option value="open">Open</option>
                    <option value="on-hold">On Hold</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-secondary mb-2">Description</label>
                  <textarea 
                    rows="4" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm focus:border-primary"
                    value={jobFormData.description} onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-secondary mb-2">Requirements</label>
                  <textarea 
                    rows="4" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm focus:border-primary"
                    value={jobFormData.requirements} onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button onClick={() => setShowJobModal(false)} type="button" className="px-4 py-2 text-sm font-semibold text-secondary bg-background rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg">{editingJob ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCandidateModal && selectedJobForCandidate && (
        <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-border bg-white">
              <h4 className="text-lg font-bold text-text-primary">Add Candidate for {selectedJobForCandidate.title}</h4>
              <button onClick={() => setShowCandidateModal(false)} className="p-1.5 text-secondary hover:bg-background rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCandidate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">First Name</label>
                  <input type="text" required className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm" 
                    value={candidateFormData.firstName} onChange={(e) => setCandidateFormData({ ...candidateFormData, firstName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Last Name</label>
                  <input type="text" required className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm" 
                    value={candidateFormData.lastName} onChange={(e) => setCandidateFormData({ ...candidateFormData, lastName: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-secondary mb-2">Email</label>
                  <input type="email" required className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm" 
                    value={candidateFormData.email} onChange={(e) => setCandidateFormData({ ...candidateFormData, email: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Phone</label>
                  <input type="tel" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm" 
                    value={candidateFormData.phone} onChange={(e) => setCandidateFormData({ ...candidateFormData, phone: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Status</label>
                  <select 
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm"
                    value={candidateFormData.status} onChange={(e) => setCandidateFormData({ ...candidateFormData, status: e.target.value})} 
                  >
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="interview">Interview</option>
                    <option value="offer">Offer</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-secondary mb-2">Resume URL</label>
                  <input type="url" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm" 
                    value={candidateFormData.resumeUrl} onChange={(e) => setCandidateFormData({ ...candidateFormData, resumeUrl: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-secondary mb-2">Notes</label>
                  <textarea rows="3" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary text-sm" 
                    value={candidateFormData.notes} onChange={(e) => setCandidateFormData({ ...candidateFormData, notes: e.target.value})} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button onClick={() => setShowCandidateModal(false)} type="button" className="px-4 py-2 text-sm font-semibold text-secondary bg-background rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg">Add Candidate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
