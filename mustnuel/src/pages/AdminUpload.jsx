// =============================================================================
// src/pages/AdminUpload.jsx
// =============================================================================
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { parseQuestionsCSV, processRawCSVText } from "../lib/csvparser";
import { FiUploadCloud, FiFileText, FiDatabase, FiAlertTriangle, FiCheckCircle, FiLayers } from "react-icons/fi";
import AdminHeader from "../components/AdminHeader";
import AppTabs from "../components/navigation/AppTabs";

export default function AdminUpload() {
  const [activeTab, setActiveTab] = useState("file"); // 'file' or 'paste'
  const [rawText, setRawText] = useState("");
  const [questions, setQuestions] = useState([]);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [successCount, setSuccessCount] = useState(null);

  const [modal, setModal] = useState({ isOpen: false, type: "", title: "", message: "" });

  function resetState() {
    setErrorMsg("");
    setSuccessCount(null);
    setQuestions([]);
    setFileName("");
  }

  async function handleFileSelection(e) {
    const file = e.target.files[0];
    if (!file) return;
    resetState();
    setFileName(file.name);

    try {
      const parsedResults = await parseQuestionsCSV(file);
      setQuestions(parsedResults);
    } catch (err) {
      handleError(err.message);
    }
  }

  function handleTextValidation() {
    if (!rawText.trim()) return;
    resetState();

    try {
      const parsedResults = processRawCSVText(rawText);
      setQuestions(parsedResults);
    } catch (err) {
      handleError(err.message);
    }
  }

  function handleError(msg) {
    const cleanMsg = msg || "An error occurred while parsing your data layout.";
    setErrorMsg(cleanMsg);
    setFileName("");
    setModal({ isOpen: true, type: "error", title: "Validation Failed", message: cleanMsg });
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
        const { error } = await supabase.from("questions").insert(chunk);
        if (error) throw error;
        rowsInserted += chunk.length;
      }

      setSuccessCount(rowsInserted);
      setQuestions([]);
      setRawText("");
      setFileName("");
      
      setModal({
        isOpen: true,
        type: "success",
        title: "Ingestion Success",
        message: `Hooray! ${rowsInserted} items safely written to database tables.`
      });
    } catch (err) {
      handleError(`Database crash: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col select-none">
      <AdminHeader currentSubTab="upload" />

      {/* MAIN VIEWPORT OVERFLOW CONTAINER */}
      <main className="max-w-7xl w-full mx-auto px-4 mt-4 h-[calc(100vh-65px-64px)] overflow-y-auto pb-12 flex flex-col gap-5 scrollbar-thin">
        
        {/* Module Title Section */}
        <div className="shrink-0">
          <h2 className="text-xl font-black text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Question Engine Management
          </h2>
          <p className="text-xs text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-body)' }}>
            Add bulk database structures using local device uploads or direct raw-text dumps.
          </p>
        </div>

        {/* CONTROLLER SWITCH TABS */}
        <div className="flex bg-surface border border-border p-1 rounded-xl max-w-xs shrink-0 gap-1">
          <button
            onClick={() => { setActiveTab("file"); resetState(); }}
            className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "file" 
                ? "bg-primary text-white shadow-sm" 
                : "text-text-secondary hover:bg-border/30"
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <FiUploadCloud size={13} />
            <span>File Upload</span>
          </button>
          <button
            onClick={() => { setActiveTab("paste"); resetState(); }}
            className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "paste" 
                ? "bg-primary text-white shadow-sm" 
                : "text-text-secondary hover:bg-border/30"
            }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <FiFileText size={13} />
            <span>Paste Raw Text</span>
          </button>
        </div>

        {/* INPUT PROCESSOR CONTAINER BOX */}
        <section className="bg-surface border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-4 shrink-0">
          {activeTab === "file" ? (
            <div className="border-2 border-dashed border-border hover:border-primary rounded-xl p-7 bg-canvas/30 text-center relative cursor-pointer group transition">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelection}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <FiUploadCloud size={26} className="text-text-muted group-hover:text-primary transition-colors" />
                <p className="text-xs font-bold text-text-primary break-all px-2" style={{ fontFamily: 'var(--font-body)' }}>
                  {fileName ? fileName : "Select or Drop Questions CSV File"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="school,subject,year,is_free,question_text,option_a,option_b,option_c,option_d,correct_option,explanation&#10;JAMB,Physics,2022,true,What is speed?,Scalar,Vector,Tensor,None,A,Speed has no direction"
                className="w-full h-40 font-mono text-[11px] p-4 rounded-xl border border-border bg-canvas text-text-primary focus:outline-none focus:border-primary leading-relaxed scrollbar-thin"
              />
              <button
                onClick={handleTextValidation}
                disabled={!rawText.trim()}
                className="w-full py-3 bg-text-primary text-canvas text-[11px] font-black uppercase tracking-wider rounded-xl transition disabled:opacity-30 cursor-pointer"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                Check & Validate Layout
              </button>
            </div>
          )}

          {/* BULK DEPLOY TRANSACTION EXECUTION TRIGGER */}
          {questions.length > 0 && (
            <button
              onClick={handleBatchUpload}
              disabled={uploading}
              className="w-full h-12 bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-sm active:scale-[0.99] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <FiDatabase size={14} />
              <span>{uploading ? "Writing to Supabase..." : `Write Batch Data (${questions.length} Rows)`}</span>
            </button>
          )}

          {/* SYSTEM RESPONSE ACTION SIGNALS */}
          {errorMsg && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-[11px] font-mono text-red-500 flex items-center gap-2">
              <FiAlertTriangle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successCount && (
            <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl text-xs font-bold text-green-500 flex items-center gap-2">
              <FiCheckCircle size={14} className="shrink-0" />
              <span>Success! Registered {successCount} question items.</span>
            </div>
          )}
        </section>

        {/* FIXED-HEIGHT VISUALIZATION MATRIX SECTION: Explicitly sized to avoid layout squishing */}
        {questions.length > 0 && (
          <section className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5" style={{ fontFamily: 'var(--font-body)' }}>
                <FiLayers size={12} className="text-primary" />
                <span>Staged Rows ({questions.length} Items)</span>
              </h3>
              <span className="text-[10px] text-text-muted italic font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                Horizontal scroll to see all columns
              </span>
            </div>

            {/* Added dedicated height and double scroll isolation here */}
            <div className="w-full h-[450px] overflow-auto border border-border rounded-xl shadow-sm bg-surface scrollbar-thin">
              <table className="w-full border-collapse text-left text-[11px] font-mono min-w-[900px]">
                <thead className="sticky top-0 z-20 bg-surface border-b border-border text-text-muted uppercase text-[9px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3 border-r border-border bg-surface/90 backdrop-blur-xs">School</th>
                    <th className="p-3 border-r border-border bg-surface/90 backdrop-blur-xs">Subject</th>
                    <th className="p-3 border-r border-border bg-surface/90 backdrop-blur-xs">Year</th>
                    <th className="p-3 border-r border-border bg-surface/90 backdrop-blur-xs">Free</th>
                    <th className="p-3 border-r border-border min-w-[260px] bg-surface/90 backdrop-blur-xs">Question Text</th>
                    <th className="p-3 border-r border-border text-center bg-surface/90 backdrop-blur-xs">Ans</th>
                    <th className="p-3 min-w-[180px] bg-surface/90 backdrop-blur-xs">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-text-primary">
                  {questions.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="border-b border-border/30 hover:bg-canvas/40 transition-colors">
                      <td className="p-3 border-r border-border/40 max-w-[110px] truncate font-sans font-black text-xs">{row.school}</td>
                      <td className="p-3 border-r border-border/40 max-w-[110px] truncate font-sans font-bold text-text-secondary">{row.subject}</td>
                      <td className="p-3 border-r border-border/40 text-text-muted">{row.year || "NULL"}</td>
                      <td className="p-3 border-r border-border/40">
                        <span className={`px-1.5 py-0.5 rounded font-sans text-[9px] font-black tracking-wide ${
                          row.is_free ? "bg-green-500/10 text-green-500" : "bg-text-muted/10 text-text-muted"
                        }`}>
                          {row.is_free ? "TRUE" : "FALSE"}
                        </span>
                      </td>
                      <td className="p-3 border-r border-border/40 max-w-[260px] truncate font-sans text-xs" title={row.question_text}>
                        {row.question_text}
                      </td>
                      <td className="p-3 border-r border-border/40 text-center">
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black">
                          {row.correct_option}
                        </span>
                      </td>
                      <td className="p-3 max-w-[180px] truncate font-sans text-text-muted italic text-xs" title={row.explanation}>
                        {row.explanation || "NULL"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {questions.length > 50 && (
              <p className="text-[10px] text-center text-text-muted font-mono pt-1">
                Truncating preview layout display context. Remaining {questions.length - 50} data fields are fully queued in cache.
              </p>
            )}
          </section>
        )}
      </main>

      <AppTabs active="admin" />

      {/* COMPONENT INTERACTION MODAL DIALOGUE WINDOW */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              modal.type === "error" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
            }`}>
              {modal.type === "error" ? <FiAlertTriangle size={22} /> : <FiCheckCircle size={22} />}
            </div>
            <h4 className="text-md font-black text-text-primary tracking-tight mb-1.5 uppercase" style={{ fontFamily: 'var(--font-display)' }}>
              {modal.title}
            </h4>
            <p className="text-xs text-text-secondary mb-5 leading-relaxed" style={{ fontFamily: 'var(--font-body)' }}>
              {modal.message}
            </p>
            <button
              onClick={() => setModal({ ...modal, isOpen: false })}
              className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-text-primary text-canvas hover:opacity-90 transition cursor-pointer"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Dismiss Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}