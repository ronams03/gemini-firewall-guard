
import React, { useState, useCallback, useMemo } from 'react';
import type { ScanResult } from '../types';
import { ScanStatus } from '../types';
import { analyzeFile } from '../services/geminiService';
import { File as FileIcon, Bug, AlertCircle, CheckCircle } from './Icons';
import type { ScanSummary } from '../App';

interface ScanViewProps {
    onScanComplete: (summary: ScanSummary) => void;
}

const ScanView: React.FC<ScanViewProps> = ({ onScanComplete }) => {
  const [scanStatus, setScanStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [scannedFiles, setScannedFiles] = useState<ScanResult[]>([]);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const progress = selectedFiles.length > 0 ? (scannedFiles.length / selectedFiles.length) * 100 : 0;
  const threats = useMemo(() => scannedFiles.filter(r => r.isThreat), [scannedFiles]);

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      setSelectedFiles(Array.from(files));
      setScannedFiles([]);
      setScanStatus(ScanStatus.IDLE);
    }
  };

  const handleDragEvents = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragging(true);
    } else if (e.type === 'dragleave') {
        setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files);
        e.dataTransfer.clearData();
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const isTextBased = /text.*|application\/(json|javascript|xml|x-sh)/.test(file.type);
        if (isTextBased || file.size < 500000) { // Read smaller files as text anyway
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        } else {
            resolve(""); // Don't read content of large non-text files
        }
    });
  };

  const runScan = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    setScanStatus(ScanStatus.SCANNING);
    setScannedFiles([]);
    const results: ScanResult[] = [];
    
    for (const file of selectedFiles) {
        setCurrentFile(file.name);
        const content = await readFileAsText(file);
        const analysis = await analyzeFile({ name: file.name, content, type: file.type, size: file.size });
        const result = { file: { name: file.name, size: file.size }, ...analysis };
        results.push(result);
        setScannedFiles([...results]);
        await new Promise(res => setTimeout(res, 100)); // simulate network time
    }

    setCurrentFile('');
    setScanStatus(ScanStatus.COMPLETED);
    onScanComplete({
        filesScanned: selectedFiles.length,
        threatsFound: results.filter(r => r.isThreat).length,
        scanTime: new Date().toLocaleTimeString(),
    });
  }, [selectedFiles, onScanComplete]);

  const ScanResults = () => (
    <div className="bg-secondary p-6 rounded-lg border border-border animate-fadeIn">
        <h3 className="text-xl font-bold mb-4">Scan Completed</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-center">
            <div className="bg-border p-4 rounded-lg">
                <p className="text-sm text-gray-400">Files Scanned</p>
                <p className="text-2xl font-bold">{selectedFiles.length}</p>
            </div>
            <div className={`bg-border p-4 rounded-lg ${threats.length > 0 ? 'text-danger' : 'text-success'}`}>
                <p className="text-sm">Threats Found</p>
                <p className="text-2xl font-bold">{threats.length}</p>
            </div>
        </div>
        {threats.length > 0 ? (
             <div>
                <h4 className="font-semibold mb-3 flex items-center text-warning"><AlertCircle className="w-5 h-5 mr-2" /> Detected Threats:</h4>
                <div className="max-h-48 overflow-y-auto pr-2">
                    {threats.map(result => (
                        <div key={result.file.name} className="bg-danger/10 p-3 rounded-lg mb-2 flex justify-between items-center text-sm">
                           <div>
                             <p className="font-semibold">{result.file.name}</p>
                             <p className="text-danger text-xs">{result.threatType} - {result.recommendation}</p>
                           </div>
                           <button className="text-xs bg-danger/50 hover:bg-danger text-white font-bold py-1 px-2 rounded">Quarantine</button>
                        </div>
                    ))}
                </div>
             </div>
        ) : (
            <div className="text-center p-6 bg-success/10 rounded-lg">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
                <h4 className="font-bold text-lg">No Threats Found</h4>
                <p className="text-gray-400 text-sm">Your system appears to be clean.</p>
            </div>
        )}
    </div>
  );

  return (
    <div>
        <h1 className="text-4xl font-bold mb-2">Threat Scan</h1>
        <p className="text-gray-400 mb-8">Select files to scan for malware, spyware, and other security threats.</p>
        
        <div 
            onDragEnter={handleDragEvents} onDragOver={handleDragEvents} onDragLeave={handleDragEvents} onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300 ${isDragging ? 'border-accent bg-accent/10' : 'border-border bg-secondary hover:border-gray-600'}`}
        >
            <input
                type="file"
                multiple
                onChange={(e) => handleFileChange(e.target.files)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="file-upload"
                aria-label="Upload files for scanning"
            />
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <Bug className="w-12 h-12 text-gray-500 mb-3" />
                <p className="font-semibold text-white">Drag & drop files here, or click to select</p>
                <p className="text-xs text-gray-400 mt-1">Maximum file size analysis is limited for this demo</p>
            </label>
        </div>

        {selectedFiles.length > 0 && (
            <div className="mt-6">
                <h3 className="font-semibold mb-2">{selectedFiles.length} File(s) Selected:</h3>
                <div className="max-h-40 overflow-y-auto bg-secondary border border-border rounded-lg p-2 space-y-1">
                    {selectedFiles.map(file => (
                        <div key={file.name + file.lastModified} className="flex items-center bg-border/50 p-2 rounded-md text-sm">
                            <FileIcon className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-300 truncate flex-grow">{file.name}</span>
                            <span className="text-gray-500 text-xs ml-3">{(file.size / 1024).toFixed(1)} KB</span>
                        </div>
                    ))}
                </div>
                <button
                    onClick={runScan}
                    disabled={scanStatus === ScanStatus.SCANNING}
                    className="w-full bg-accent hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center text-lg mt-4"
                >
                    <Bug className="w-5 h-5 mr-2" />
                    {scanStatus === ScanStatus.SCANNING ? 'Scanning...' : `Scan ${selectedFiles.length} File(s)`}
                </button>
            </div>
        )}

        {scanStatus === ScanStatus.SCANNING && (
             <div className="w-full bg-secondary p-6 rounded-lg border border-border mt-6">
                <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="font-semibold text-gray-300">Scan in Progress...</span>
                    <span className="font-bold text-accent">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                    <div className="bg-accent h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-center text-gray-400 mt-3 text-xs truncate">Scanning: {currentFile}</p>
            </div>
        )}

        {scanStatus === ScanStatus.COMPLETED && (
            <div className="mt-6">
                <ScanResults />
            </div>
        )}
    </div>
  );
};

export default ScanView;
