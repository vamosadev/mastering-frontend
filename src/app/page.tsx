"use client";

import { useState } from "react";

type FileZone = "target" | "reference" | null;

export default function HomePage() {
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [refFile, setRefFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent, zone: FileZone) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file?.type?.startsWith("audio/")) return;

    if (zone === "target") setTargetFile(file);
    if (zone === "reference") setRefFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, zone: FileZone) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (zone === "target") setTargetFile(file);
    if (zone === "reference") setRefFile(file);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const processAudio = async () => {
    if (!targetFile || !refFile) return;

    setProcessing(true);
    setDownloadUrl(null);

    const formData = new FormData();
    formData.append("target", targetFile);
    formData.append("reference", refFile);

    try {
      const res = await fetch(`${API_URL}/process`, {
        method: "POST",
        body: formData,
      }).catch(err => {
        console.error("Fetch error:", err);
        throw err;
      });

      if (!res.ok) throw new Error("Processing failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du processing. Assure-toi que le backend tourne sur localhost:8000");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-light tracking-tight mb-12">
        <span className="text-orange-500">Master</span>ing
      </h1>

      <div className="w-full max-w-xl space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-400">TARGET (votre son)</p>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "target")}
            className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
          >
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              id="target-input"
              onChange={(e) => handleFileSelect(e, "target")}
            />
            <label htmlFor="target-input" className="cursor-pointer">
              {targetFile ? (
                <p className="text-orange-500">{targetFile.name}</p>
              ) : (
                <p className="text-gray-500">Drop votre fichier audio</p>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-400">REFERENCE (son cible)</p>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, "reference")}
            className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
          >
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              id="ref-input"
              onChange={(e) => handleFileSelect(e, "reference")}
            />
            <label htmlFor="ref-input" className="cursor-pointer">
              {refFile ? (
                <p className="text-orange-500">{refFile.name}</p>
              ) : (
                <p className="text-gray-500">Drop fichier référence</p>
              )}
            </label>
          </div>
        </div>

        <button
          onClick={processAudio}
          disabled={!targetFile || !refFile || processing}
          className="w-full bg-orange-500 text-black font-medium py-4 rounded-lg hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? "Processing..." : "Master"}
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download="mastered.wav"
            className="block w-full bg-green-600 text-white text-center font-medium py-4 rounded-lg hover:bg-green-500"
          >
            Download Mastered
          </a>
        )}
      </div>
    </main>
  );
}