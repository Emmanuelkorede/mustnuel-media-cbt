import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { parseQuestionsCSV } from "../lib/csvparser";

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
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Question Batch Bulk Ingestion
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Populate your app question banks dynamically using standard format CSV templates.
        </p>
      </div>

      {/* FILE DROPZONE */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col gap-5 shadow-sm">
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 rounded-xl p-8 bg-gray-50 dark:bg-gray-900/50 text-center transition relative cursor-pointer group">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelection}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-3xl group-hover:scale-110 transition duration-200">📊</span>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 break-all px-2">
              {fileName ? fileName : "Tap to choose Questions CSV"}
            </p>
            <p className="text-xs text-gray-400 font-mono">
              Requires headers: school, subject, question_text, option_a, option_b, option_c, option_d, correct_option
            </p>
          </div>
        </div>

        {questions.length > 0 && (
          <button
            onClick={handleBatchUpload}
            disabled={uploading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition active:scale-[0.99] disabled:opacity-50"
          >
            {uploading ? "Ingesting Database Entries..." : `🚀 Execute Batch Upload (${questions.length} Items)`}
          </button>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-mono text-red-600">
            ❌ {errorMsg}
          </div>
        )}

        {successCount && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm font-bold text-green-600">
            🎉 Success! Registered {successCount} question entries.
          </div>
        )}
      </section>

      {/* HORIZONTAL PREVIEW CARDS */}
      {previewRows.length > 0 && (
        <section className="space-y-3">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span>🔎</span> Pre-Upload Sample Check
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Swipe horizontally to review the first {previewRows.length} question blocks before deployment.
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x snap-mandatory scrollbar-thin">
            {previewRows.map((row, idx) => (
              <div 
                key={idx}
                className="w-[300px] shrink-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 snap-center flex flex-col gap-4 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 text-xs">
                  <span className="font-bold text-blue-600 uppercase truncate">
                    {row.school} {row.year && `'${row.year.toString().slice(-2)}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {row.subject}
                    </span>
                    {row.is_free && (
                      <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">FREE</span>
                    )}
                  </div>
                </div>

                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 line-clamp-3">
                  {row.question_text}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
                  <div className="truncate bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                    <span className="font-bold text-gray-400">A:</span> {row.option_a}
                  </div>
                  <div className="truncate bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                    <span className="font-bold text-gray-400">B:</span> {row.option_b}
                  </div>
                  <div className="truncate bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                    <span className="font-bold text-gray-400">C:</span> {row.option_c}
                  </div>
                  <div className="truncate bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                    <span className="font-bold text-gray-400">D:</span> {row.option_d}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500">Correct Choice:</span>
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-md font-mono font-bold">
                      {row.correct_option}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 italic line-clamp-2">
                    {row.explanation ? row.explanation : "No extra explanations given."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODAL SYSTEM */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h4 className={`text-lg font-bold mb-2 ${modal.type === "error" ? "text-red-500" : "text-green-600"}`}>
              {modal.title}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {modal.message}
            </p>
            <button
              onClick={() => setModal({ ...modal, isOpen: false })}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}