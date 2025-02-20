// Configuración inicial de PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const PDFLib = window.PDFLib;

// Variables globales
let uploadedFiles = [];

// Elementos del DOM
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
const processButton = document.getElementById('processButton');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const statusElement = document.getElementById('status');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Click en la zona de arrastre
    dropZone.addEventListener('click', () => fileInput.click());
    
    // Cambio en el input de archivos
    fileInput.addEventListener('change', handleFileSelect);
    
    // Eventos de arrastre (drag and drop)
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    // Botón de procesamiento
    processButton.addEventListener('click', processFiles);
}

// Eventos
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-active');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-active');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-active');
    
    if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
    }
}

function handleFileSelect(event) {
    handleFiles(event.target.files);
}

// Procesamiento de archivos
async function handleFiles(files) {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
        if (file.type === 'application/pdf') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                
                const fileObject = {
                    name: file.name,
                    data: arrayBuffer,
                    totalPages: pdf.numPages,
                    pagesToExtract: `1-${pdf.numPages}`
                };
                
                uploadedFiles.push(fileObject);
                renderFileList();
                
                if (uploadedFiles.length > 0) {
                    processButton.disabled = false;
                }
            } catch (error) {
                console.error('Error al procesar el archivo:', error);
                showNotification(`Error al procesar ${file.name}. Verifica que sea un PDF válido.`, 'error');
            }
        } else {
            showNotification(`${file.name} no es un archivo PDF. Por favor, sube solo archivos PDF.`, 'warning');
        }
    }
}

// Renderizado de la interfaz
function renderFileList() {
    fileList.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        fileItem.innerHTML = `
            <div class="file-name">${file.name}</div>
            <div class="file-pages">
                <span>Páginas: </span>
                <input type="text" class="page-input" 
                    value="${file.pagesToExtract}" 
                    placeholder="Ej: 1-5, 8, 11-13"
                    onchange="updatePageRange(${index}, this.value)">
                <span>de ${file.totalPages}</span>
            </div>
        `;
        
        fileList.appendChild(fileItem);
    });
}

// Actualización de rangos de páginas
function updatePageRange(index, value) {
    uploadedFiles[index].pagesToExtract = value;
}

// Notificaciones
function showNotification(message, type = 'info') {
    alert(message);
}

// Procesamiento principal de PDFs
async function processFiles() {
    if (uploadedFiles.length === 0) return;
    
    // Mostrar barra de progreso
    progressContainer.classList.remove('hidden');
    processButton.disabled = true;
    progressBar.style.width = '0%';
    
    try {
        // Procesar cada archivo
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            statusElement.textContent = `Procesando: ${file.name}`;
            
            // Extraer páginas específicas
            const pdfDoc = await PDFLib.PDFDocument.load(file.data);
            const newPdfDoc = await PDFLib.PDFDocument.create();
            
            // Parsear el rango de páginas
            const pageRanges = parsePageRanges(file.pagesToExtract, file.totalPages);
            const uniquePages = [...new Set(pageRanges.flat())];
            uniquePages.sort((a, b) => a - b);
            
            // Copiar páginas al nuevo documento
            const copiedPages = await newPdfDoc.copyPages(pdfDoc, uniquePages.map(p => p - 1));
            copiedPages.forEach(page => newPdfDoc.addPage(page));
            
            // Aplicar compresión según el nivel seleccionado
            const compressionLevel = document.getElementById('compressionLevel').value;
            let pdfBytes;
            
            if (compressionLevel === 'high') {
                pdfBytes = await newPdfDoc.save({
                    useObjectStreams: true,
                    addDefaultPage: false,
                    objectsPerTick: 50,
                    compress: true
                });
            } else if (compressionLevel === 'medium') {
                pdfBytes = await newPdfDoc.save({
                    useObjectStreams: true,
                    compress: true
                });
            } else {
                pdfBytes = await newPdfDoc.save({
                    useObjectStreams: false,
                    compress: false
                });
            }
            
            // Descargar el archivo resultante
            const fileName = file.name.replace('.pdf', '_recortado.pdf');
            downloadBlob(pdfBytes, fileName);
            
            // Actualizar progreso
            const progressPercentage = ((i + 1) / uploadedFiles.length) * 100;
            progressBar.style.width = `${progressPercentage}%`;
        }
        
        statusElement.textContent = '¡Procesamiento completado!';
        statusElement.classList.add('text-green-600', 'font-medium');
        
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            processButton.disabled = false;
            statusElement.classList.remove('text-green-600', 'font-medium');
        }, 3000);
        
    } catch (error) {
        console.error('Error al procesar archivos:', error);
        statusElement.textContent = 'Error al procesar archivos. Inténtalo de nuevo.';
        statusElement.classList.add('text-red-600');
        processButton.disabled = false;
    }
}

// Utilidades
function parsePageRanges(rangeStr, totalPages) {
    const ranges = [];
    const parts = rangeStr.split(',').map(part => part.trim());
    
    for (const part of parts) {
        if (part.includes('-')) {
            // Es un rango (ej. 1-5)
            const [start, end] = part.split('-').map(num => parseInt(num.trim()));
            if (!isNaN(start) && !isNaN(end) && start <= end && start >= 1 && end <= totalPages) {
                ranges.push(Array.from({length: end - start + 1}, (_, i) => start + i));
            }
        } else {
            // Es un número individual
            const pageNum = parseInt(part);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                ranges.push([pageNum]);
            }
        }
    }
    
    return ranges;
}

function downloadBlob(data, fileName) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Hacer disponible la función updatePageRange globalmente
window.updatePageRange = updatePageRange;