// Configuración inicial de PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const PDFLib = window.PDFLib;

// Variables globales
let uploadedFiles = [];
let isProcessing = false;

// Elementos del DOM
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileList = document.getElementById('fileList');
const processButton = document.getElementById('processButton');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const statusElement = document.getElementById('status');

// Verificación de dependencias
function checkDependencies() {
    if (!pdfjsLib) {
        console.error("PDF.js no se ha cargado correctamente");
        showNotification("Error: No se pudo cargar PDF.js. Por favor, recarga la página.", "error");
        return false;
    }
    
    if (!PDFLib) {
        console.error("PDF-lib.js no se ha cargado correctamente");
        showNotification("Error: No se pudo cargar PDF-lib.js. Por favor, recarga la página.", "error");
        return false;
    }
    
    return true;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (checkDependencies()) {
        setupEventListeners();
        console.log("PDF Helper inicializado correctamente");
    }
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

// Manejadores de eventos
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
    if (!checkDependencies()) return;
    
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
        if (file.type === 'application/pdf') {
            try {
                statusElement.textContent = `Analizando: ${file.name}`;
                progressContainer.classList.remove('hidden');
                
                const arrayBuffer = await file.arrayBuffer();
                
                // Validar que es un PDF válido
                try {
                    const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
                    
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
                    
                    progressContainer.classList.add('hidden');
                } catch (pdfError) {
                    console.error('Error al validar PDF:', pdfError);
                    progressContainer.classList.add('hidden');
                    showNotification(`Error: ${file.name} parece ser un PDF dañado o protegido.`, 'error');
                }
            } catch (error) {
                console.error('Error al procesar el archivo:', error);
                progressContainer.classList.add('hidden');
                showNotification(`Error al leer ${file.name}. ${error.message}`, 'error');
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

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Implementación básica para mostrar notificaciones
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-md transition-opacity duration-500 z-50`;
    
    // Establecer color según el tipo
    if (type === 'error') {
        notificationDiv.classList.add('bg-red-500', 'text-white');
    } else if (type === 'warning') {
        notificationDiv.classList.add('bg-yellow-500', 'text-white');
    } else if (type === 'success') {
        notificationDiv.classList.add('bg-green-500', 'text-white');
    } else {
        notificationDiv.classList.add('bg-blue-500', 'text-white');
    }
    
    notificationDiv.innerHTML = `
        <div class="flex items-center">
            <div class="ml-3">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button class="ml-auto bg-transparent text-white" onclick="this.parentNode.parentNode.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(notificationDiv);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        notificationDiv.classList.add('opacity-0');
        setTimeout(() => {
            if (notificationDiv.parentNode) {
                notificationDiv.parentNode.removeChild(notificationDiv);
            }
        }, 500);
    }, 5000);
}

// Procesamiento principal de PDFs
async function processFiles() {
    if (uploadedFiles.length === 0 || isProcessing) return;
    if (!checkDependencies()) return;
    
    isProcessing = true;
    
    // Mostrar barra de progreso
    progressContainer.classList.remove('hidden');
    processButton.disabled = true;
    progressBar.style.width = '0%';
    
    try {
        // Procesar cada archivo
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            statusElement.textContent = `Procesando: ${file.name}`;
            
            try {
                // Extraer páginas específicas
                const pdfDoc = await PDFLib.PDFDocument.load(file.data);
                
                // Verificar si el documento está encriptado
                if (pdfDoc.isEncrypted) {
                    throw new Error('El documento está protegido. No se puede procesar.');
                }
                
                const newPdfDoc = await PDFLib.PDFDocument.create();
                
                // Parsear el rango de páginas
                const pageRanges = parsePageRanges(file.pagesToExtract, file.totalPages);
                
                if (pageRanges.length === 0) {
                    throw new Error('No se especificaron páginas válidas para extraer.');
                }
                
                const uniquePages = [...new Set(pageRanges.flat())];
                uniquePages.sort((a, b) => a - b);
                
                // Validar que hay páginas para copiar
                if (uniquePages.length === 0) {
                    throw new Error('El rango de páginas especificado es inválido.');
                }
                
                // Copiar páginas al nuevo documento
                const pagesToCopy = uniquePages.map(p => p - 1);
                
                const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToCopy);
                copiedPages.forEach(page => newPdfDoc.addPage(page));
                
                // Aplicar compresión según el nivel seleccionado
                const compressionLevel = document.getElementById('compressionLevel').value;
                let pdfBytes;
                
                try {
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
                } catch (saveError) {
                    console.error('Error al guardar el PDF:', saveError);
                    throw new Error('Error al comprimir el documento.');
                }
                
                // Descargar el archivo resultante
                const fileName = file.name.replace('.pdf', '_recortado.pdf');
                downloadBlob(pdfBytes, fileName);
                
                // Actualizar progreso
                const progressPercentage = ((i + 1) / uploadedFiles.length) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                
            } catch (fileError) {
                console.error(`Error procesando ${file.name}:`, fileError);
                showNotification(`Error con ${file.name}: ${fileError.message}`, 'error');
            }
        }
        
        statusElement.textContent = '¡Procesamiento completado!';
        statusElement.classList.add('text-green-600', 'font-medium');
        showNotification('Todos los archivos procesados correctamente', 'success');
        
    } catch (error) {
        console.error('Error general al procesar archivos:', error);
        statusElement.textContent = 'Error al procesar archivos. Inténtalo de nuevo.';
        statusElement.classList.add('text-red-600');
        showNotification(`Error: ${error.message || 'Ha ocurrido un error inesperado'}`, 'error');
    } finally {
        setTimeout(() => {
            progressContainer.classList.add('hidden');
            processButton.disabled = false;
            statusElement.classList.remove('text-green-600', 'font-medium', 'text-red-600');
            isProcessing = false;
        }, 3000);
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
    try {
        const blob = new Blob([data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error al descargar el archivo:', error);
        showNotification('Error al descargar el archivo', 'error');
    }
}

// Hacer disponible las funciones necesarias globalmente
window.updatePageRange = updatePageRange;

// Añade esto al final de app.js
function testPDFLibrary() {
  try {
      // Prueba PDF.js
      const pdfjsTest = pdfjsLib.getDocument ? "OK" : "Falla";
      
      // Prueba PDF-lib
      const pdfLibTest = PDFLib.PDFDocument ? "OK" : "Falla";
      
      console.log("Estado de las bibliotecas:");
      console.log(`- PDF.js: ${pdfjsTest}`);
      console.log(`- PDF-lib: ${pdfLibTest}`);
      
      return pdfjsTest === "OK" && pdfLibTest === "OK";
  } catch (error) {
      console.error("Error al probar las bibliotecas:", error);
      return false;
  }
}

// Ejecuta esta función en la consola del navegador para diagnosticar
window.testPDFLibrary = testPDFLibrary;