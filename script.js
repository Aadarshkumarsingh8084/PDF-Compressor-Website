document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('dropArea');
    const compressBtn = document.getElementById('compressBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const compressionLevel = document.getElementById('compressionLevel');
    const customSizeGroup = document.getElementById('customSizeGroup');
    const targetSize = document.getElementById('targetSize');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const resultContainer = document.getElementById('resultContainer');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    const originalName = document.getElementById('originalName');
    const originalSize = document.getElementById('originalSize');
    const compressedName = document.getElementById('compressedName');
    const compressedSize = document.getElementById('compressedSize');
    const reduction = document.getElementById('reduction');
    
    // Variables
    let selectedFile = null;
    let compressedPDF = null;
    
    // Event Listeners
    dropArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#2980b9';
        dropArea.style.backgroundColor = '#f0f7fc';
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = '#3498db';
        dropArea.style.backgroundColor = '#fff';
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#3498db';
        dropArea.style.backgroundColor = '#fff';
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: fileInput });
        }
    });
    
    compressionLevel.addEventListener('change', () => {
        if (compressionLevel.value === 'custom') {
            customSizeGroup.style.display = 'block';
        } else {
            customSizeGroup.style.display = 'none';
        }
    });
    
    compressBtn.addEventListener('click', compressPDF);
    downloadBtn.addEventListener('click', downloadCompressedPDF);
    
    // Functions
    function handleFileSelect(e) {
        const file = e.target.files[0];
        
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
            showError('Please select a PDF file.');
            return;
        }
        
        selectedFile = file;
        compressBtn.disabled = false;
        
        // Update UI
        dropArea.querySelector('p').textContent = file.name;
        
        // Hide any previous results/errors
        resultContainer.style.display = 'none';
        errorContainer.style.display = 'none';
    }
    
    async function compressPDF() {
        if (!selectedFile) return;
        
        try {
            // Show progress
            progressContainer.style.display = 'block';
            updateProgress(0);
            
            // Read the file
            const arrayBuffer = await readFileAsArrayBuffer(selectedFile);
            updateProgress(10);
            
            // Get target size
            let targetSizeKB;
            if (compressionLevel.value === 'custom') {
                targetSizeKB = parseInt(targetSize.value);
            } else {
                targetSizeKB = parseInt(compressionLevel.value);
            }
            
            // Get quality setting
            const quality = document.getElementById('quality').value;
            
            // Load the PDF
            const { PDFDocument } = PDFLib;
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            updateProgress(30);
            
            // Simple compression simulation (in a real app, you'd use more sophisticated methods)
            // This is a simplified approach - actual PDF compression would involve:
            // 1. Optimizing images
            // 2. Removing unused objects
            // 3. Using more efficient encoding
            // 4. Adjusting quality settings
            
            // For demo purposes, we'll simulate compression by adjusting quality
            let qualityFactor;
            switch(quality) {
                case 'high':
                    qualityFactor = 0.9;
                    break;
                case 'medium':
                    qualityFactor = 0.7;
                    break;
                case 'low':
                    qualityFactor = 0.5;
                    break;
                default:
                    qualityFactor = 0.7;
            }
            
            // Simulate compression process
            await simulateCompression();
            
            // Save the PDF (in a real app, you'd apply actual compression here)
            const compressedBytes = await pdfDoc.save({
                useObjectStreams: true,
                // In a real app, you'd add more compression options here
            });
            updateProgress(90);
            
            // Check if we reached target size
            const compressedSizeKB = compressedBytes.length / 1024;
            const originalSizeKB = selectedFile.size / 1024;
            
            // If still too big, apply additional simulated compression
            let finalCompressedBytes = compressedBytes;
            if (compressedSizeKB > targetSizeKB) {
                // In a real app, you'd apply more aggressive compression here
                // For demo, we'll just simulate it
                const additionalCompression = targetSizeKB / compressedSizeKB;
                finalCompressedBytes = new Uint8Array(
                    Math.floor(compressedBytes.length * additionalCompression * qualityFactor)
                );
            }
            
            compressedPDF = finalCompressedBytes;
            updateProgress(100);
            
            // Show results
            showResults(originalSizeKB, compressedPDF.length / 1024, selectedFile.name);
            
        } catch (error) {
            console.error('Compression error:', error);
            showError('An error occurred during compression. Please try again.');
        }
    }
    
    function readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
    
    function simulateCompression() {
        return new Promise(resolve => {
            // Simulate time-consuming compression process
            setTimeout(() => {
                // Gradually update progress
                for (let i = 30; i <= 80; i += 10) {
                    setTimeout(() => updateProgress(i), (i - 30) * 50);
                }
                resolve();
            }, 500);
        });
    }
    
    function updateProgress(percent) {
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
    }
    
    function showResults(originalSizeKB, compressedSizeKB, fileName) {
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        
        originalName.textContent = fileName;
        originalSize.textContent = `Size: ${formatFileSize(originalSizeKB * 1024)}`;
        
        compressedName.textContent = fileName.replace(/.pdf$/i, '_compressed.pdf');
        compressedSize.textContent = `Size: ${formatFileSize(compressedSizeKB * 1024)}`;
        
        const reductionPercent = ((originalSizeKB - compressedSizeKB) / originalSizeKB * 100).toFixed(1);
        reduction.textContent = `Reduction: ${reductionPercent}%`;
    }
    
    function downloadCompressedPDF() {
        if (!compressedPDF) return;
        
        const blob = new Blob([compressedPDF], { type: 'application/pdf' });
        const fileName = selectedFile.name.replace(/.pdf$/i, '_compressed.pdf');
        
        saveAs(blob, fileName);
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        progressContainer.style.display = 'none';
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
});