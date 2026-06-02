
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { parseQuestionsCSV } from "../lib/csvparser";
import { FiUploadCloud, FiDatabase, FiAlertTriangle, FiCheckCircle, FiEye } from "react-icons/fi";
import AdminHeader from "../components/AdminHeader";
import AppTabs from "../components/navigation/AppTabs";

export default function AdminUpload() {
  const [questions, setQuestions] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successCount, setSuccessCount] = useState(null);

  const [modal, setModal] = useState({ isOpen: false, type: "", title: "", message: "" });

  async function handleFileSelection(e) {
    const file = e.target.files[0];
    if (!file) return;

    setErrorMsg("");
    setSuccessCount(null);
    setQuestions([]);
    setPreviewRows([]);
    setFileName(file.name);

    try {
      const parsedResults = await parseQuestionsCSV(file);
      setQuestions(parsedResults);
      setPreviewRows(parsedResults.slice(0, 30));
    } catch (err) {
      const msg = err.message || "An error occurred while parsing your template.";
      setErrorMsg(msg);
      setFileName("");
      setModal({ isOpen: true, type: "error", title: "Parsing Failed", message: msg });
    }
  }

  async function handleBatchUpload() {
    if (questions.length === 0) return;

    setUploading(true);
    setErrorMsg("");
    setSuccessCount(null);

    try {
      const chunkSize = 1000;
      let rowsInserted = 0;

      for (let i = 0; i < questions.length; i += chunkSize) {
        const chunk = questions.slice(i, i + chunkSize);
        
        const { error } = await supabase
          .from("questions")
          .insert(chunk);

        if (error) throw error;
        rowsInserted += chunk.length;
      }

      setSuccessCount(rowsInserted);
      setQuestions([]);
      setPreviewRows([]);
      setFileName("");
      
      setModal({
        isOpen: true,
        type: "success",
        title: "Ingestion Success",
        message: `Hooray! ${rowsInserted} question profiles have been completely cataloged into the database ecosystem.`
      });
    } catch (err) {
      const msg = `Database ingestion crashed: ${err.message}`;
      setErrorMsg(msg);
      setModal({ isOpen: true, type: "error", title: "Upload Interrupted", message: msg });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col select-none">
      <AdminHeader currentSubTab="upload" />

      {/* FIXED BOUNDING VIEWPORT: Prevents items sliding beneath floating bottom navbar layout elements */}
      <main className="max-w-7xl w-full mx-auto px-4 mt-4 h-[calc(100vh-65px-64px)] overflow-y-auto pb-12 flex flex-col gap-6 scrollbar-thin">
        
        {/* Module Text Title Block */}
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Question Batch Bulk Ingestion
          </h2>
          <p className="text-xs text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
            Populate your app question banks dynamically using standard format CSV templates.
          </p>
        </div>

        {/* INTERACTIVE DROPZONE GATEWAY CARD */}
        <section className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
          
          <div className="border-2 border-dashed border-border hover:border-primary rounded-xl p-8 bg-canvas/30 text-center transition relative cursor-pointer group">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelection}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <FiUploadCloud size={28} className="text-text-muted group-hover:text-primary transition-colors" />
              <p className="text-xs font-bold text-text-primary break-all px-2" style={{ fontFamily: 'var(--font-body)' }}>
                {fileName ? fileName : "Tap or Drag Questions CSV here"}
              </p>
              <p className="text-[10px] text-text-muted font-mono max-w-md mx-auto leading-relaxed">
                Required schema headers: <span className="text-primary font-bold">school, subject, question_text, option_a, option_b, option_c, option_d, correct_option</span>
              </p>
            </div>
          </div>

          {questions.length > 0 && (
            <button
              onClick={handleBatchUpload}
              disabled={uploading}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-sm active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <FiDatabase size={14} />
              <span>{uploading ? "Ingesting Database Entries..." : `Execute Batch Upload (${questions.length} Items)`}</span>
            </button>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl text-[11px] font-mono text-red-500 flex items-center gap-2">
              <FiAlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount && (
            <div className="p-3.5 bg-green-500/5 border border-green-500/20 rounded-xl text-xs font-bold text-green-500 flex items-center gap-2">
              <FiCheckCircle size={14} className="shrink-0" />
              <span>Success! Registered {successCount} question entries.</span>
            </div>
          )}
        </section>

        {/* HORIZONTAL SWIPEABLE PREVIEW CONTAINER */}
        {previewRows.length > 0 && (
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-black text-text-primary uppercase tracking-tight flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <FiEye className="text-primary" size={16} /> 
                <span>Pre-Upload Sample Check</span>
              </h3>
              <p className="text-xs text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                Swipe horizontally to review the first {previewRows.length} question blocks before deployment.
              </p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin">
              {previewRows.map((row, idx) => (
                <div 
                  key={idx}
                  className="w-[310px] shrink-0 bg-surface border border-border rounded-2xl p-4 snap-center flex flex-col gap-3.5 shadow-sm hover:border-border-hover transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-border pb-2 text-[11px]">
                    <span className="font-black text-primary uppercase tracking-wider truncate max-w-[140px]" style={{ fontFamily: 'var(--font-body)' }}>
                      {row.school} {row.year && `'${row.year.toString().slice(-2)}`}
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-text-secondary truncate max-w-[100px]" style={{ fontFamily: 'var(--font-body)' }}>
                        {row.subject}
                      </span>
                      {row.is_free && (
                        <span className="bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wide uppercase shrink-0">
                          FREE
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-bold text-text-primary leading-relaxed line-clamp-3" style={{ fontFamily: 'var(--font-body)' }}>
                    {row.question_text}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-text-secondary font-mono">
                    <div className="truncate bg-canvas border border-border/50 p-2 rounded-lg">
                      <span className="font-black text-text-muted mr-1">A:</span>{row.option_a}
                    </div>
                    <div className="truncate bg-canvas border border-border/50 p-2 rounded-lg">
                      <span className="font-black text-text-muted mr-1">B:</span>{row.option_b}
                    </div>
                    <div className="truncate bg-canvas border border-border/50 p-2 rounded-lg">
                      <span className="font-black text-text-muted mr-1">C:</span>{row.option_c}
                    </div>
                    <div className="truncate bg-canvas border border-border/50 p-2 rounded-lg">
                      <span className="font-black text-text-muted mr-1">D:</span>{row.option_d}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2.5 border-t border-border mt-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-text-muted">Correct Target:</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md font-mono font-black">
                        {row.correct_option}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted italic line-clamp-2 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
                      {row.explanation ? row.explanation : "No diagnostic breakdown explanation included."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <AppTabs active="admin" />

      {/* APP INTEGRATED MODAL OVERLAY */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center flex flex-col items-center">
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              modal.type === "error" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
            }`}>
              {modal.type === "error" ? <FiAlertTriangle size={24} /> : <FiCheckCircle size={24} />}
            </div>

            <h4 className="text-md font-black text-text-primary tracking-tight mb-2 uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              {modal.title}
            </h4>
            <p className="text-xs text-text-secondary mb-6 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              {modal.message}
            </p>
            
            <button
              onClick={() => setModal({ ...modal, isOpen: false })}
              className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-text-primary text-canvas hover:opacity-90 transition cursor-pointer"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Close Overlay Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}