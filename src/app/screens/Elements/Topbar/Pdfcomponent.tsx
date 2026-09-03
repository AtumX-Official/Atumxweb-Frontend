import { useState,useRef,useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useDraggable } from "@dnd-kit/core";
import {  FiX } from "react-icons/fi";
import { createPortal } from "react-dom";
// @ts-ignore
import workerSrc from '../../../../src/pdf.worker.min.js?url'; 
import 'react-pdf/dist/Page/TextLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

interface PDFComponentProps {
  pdfUrl: string
  onClose: () => void
  position: { x: number; y: number }
  title: string
}

const PDFComponent = ({ pdfUrl, onClose, position, title } : PDFComponentProps) => {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [size, setSize] = useState({ width: 550, height: 650 });
  const [isResizing, setIsResizing] = useState(false);
  const [inputPage, setInputPage] = useState("1");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    { pageNumber: number }[]
  >([]);
 const scrollbarRef = useRef<HTMLDivElement>(null);
 const isScrollingFromCode = useRef(false);

  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  // Inject scrollbar + hide number input spinners into <head> once
  useEffect(() => {
    const styleId = "pdf-component-style";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = `
        .pdf-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .pdf-scroll::-webkit-scrollbar-track { background: #1e2022; border-radius: 4px; }
        .pdf-scroll::-webkit-scrollbar-thumb { background: #F6EC24; border-radius: 4px; }
        .pdf-scroll::-webkit-scrollbar-thumb:hover { background: #d4cc10; }
        .pdf-scroll { scrollbar-width: thin; scrollbar-color: #F6EC24 #1e2022; }
        .pdf-page-input::-webkit-inner-spin-button,
        .pdf-page-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .pdf-page-input { -moz-appearance: textfield; }
        /* slim yellow scrollbar for the navigator */
.pdf-scroll-nav::-webkit-scrollbar { height: 6px; }
.pdf-scroll-nav::-webkit-scrollbar-track { background: #1e2022; }
.pdf-scroll-nav::-webkit-scrollbar-thumb { background: #F6EC24; border-radius: 3px; min-width: 40px; }
.pdf-scroll-nav { scrollbar-width: thin; scrollbar-color: #F6EC24 #1e2022; }

      `;
      document.head.appendChild(styleEl);
    }
  }, []);
// Sync scrollbar position → when page changes externally (search, buttons, input)
useEffect(() => {
  const el = scrollbarRef.current;
  if (!el || numPages <= 1) return;
  isScrollingFromCode.current = true;
  el.scrollLeft = ((page - 1) / (numPages - 1)) * (el.scrollWidth - el.clientWidth);
  setTimeout(() => { isScrollingFromCode.current = false; }, 50);
}, [page, numPages]);
  const { setNodeRef, listeners, attributes, transform } = useDraggable({
    id: "pdf-viewer",
    disabled: isResizing,
  });

  const handleResizeMouseDown = (e : React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const onMouseMove = (moveEvent : MouseEvent) => {
      const newWidth = Math.max(350, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(400, startHeight + (moveEvent.clientY - startY));
      setSize({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomStep = 0.1;
      if (e.deltaY < 0) {
        setScale(prev => Math.min(prev + zoomStep, 3.0));
      } else {
        setScale(prev => Math.max(prev - zoomStep, 0.4));
      }
    }
  };

  const goToPage = (newPage: number) => {
    const clamped = Math.min(numPages, Math.max(1, newPage));
    setPage(clamped);
    setInputPage(String(clamped));
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handlePageInputCommit = () => {
    const parsed = parseInt(inputPage, 10);
    if (!isNaN(parsed)) {
      goToPage(parsed);
    } else {
      setInputPage(String(page));
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handlePageInputCommit();
  };

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${position.x + transform.x}px, ${position.y + transform.y}px, 0)`
      : `translate3d(${position.x}px, ${position.y}px, 0)`,
    position: "fixed",
    top: 150,
    right: 40,
    width: size.width,
    height: size.height,
    zIndex: 999999,
    background: "#fff",
    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    borderRadius: "10px",
  
    touchAction: "none",
  };
  const searchPDF = async () => {
    if (!pdfDoc || !searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
  
    const matches: { pageNumber: number }[] = [];
  
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
  
      const textContent = await page.getTextContent();
  
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
  
      if (
        pageText
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        matches.push({
          pageNumber: pageNum,
        });
      }
    }
  
    setSearchResults(matches);
    setCurrentResultIndex(0);
  
    if (matches.length > 0) {
      goToPage(matches[0].pageNumber);
    }
  };
  const nextResult = () => {
    if (!searchResults.length) return;
  
    const next =
      (currentResultIndex + 1) %
      searchResults.length;
  
    setCurrentResultIndex(next);
  
    goToPage(searchResults[next].pageNumber);
  };
  const prevResult = () => {
    if (!searchResults.length) return;
  
    const prev =
      (currentResultIndex - 1 + searchResults.length) %
      searchResults.length;
  
    setCurrentResultIndex(prev);
  
    goToPage(searchResults[prev].pageNumber);
  };
  const customTextRenderer = ({
    str,
  }: {
    str: string;
  }) => {
    if (!searchTerm) return str;
  
    const escaped = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
  
    const regex = new RegExp(
      `(${escaped})`,
      "gi"
    );
  
    return str.replace(
      regex,
      `<mark style="background:#F6EC24;padding:0;">$1</mark>`
    );
  };
  return createPortal(
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* 1. HEADER */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#F6EC24] border-b shadow-sm">
        <div {...listeners} className="flex-1 font-bold text-gray-800 cursor-move text-sm truncate pr-2">
          {title}
        </div>
        <div className="flex items-center gap-2 mr-2">
  <input
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(e.target.value)
    }
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        searchPDF();
      }
    }}
    placeholder="Search..."
    className="h-7 px-2 text-xs rounded border"
  />

  <button
    onClick={searchPDF}
    className="bg-black text-white px-2 py-1 rounded text-xs"
  >
    Search
  </button>

  <button
    onClick={prevResult}
    disabled={!searchResults.length}
    className="text-xs px-2"
  >
    ▲
  </button>

  <button
    onClick={nextResult}
    disabled={!searchResults.length}
    className="text-xs px-2"
  >
    ▼
  </button>

  <span className="text-xs">
    {searchResults.length
      ? `${currentResultIndex + 1}/${searchResults.length}`
      : "0/0"}
  </span>
</div>
         <button onClick={onClose} title='Close' className="bg-[#EA221F] rounded w-6 h-6 flex items-center justify-center">
          <FiX className="w-4 h-4 text-white" />
          </button>
      </div>

      {/* 2. PDF VIEWPORT */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="pdf-scroll flex-1 overflow-auto bg-[#323639] flex justify-center px-4 py-2"
        style={{ minHeight: 0 }}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={(pdf) => {
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            setInputPage("1");
          }}
          loading={<div className="text-white mt-10">Initializing Document...</div>}
        >
        <Page
  key={`${page}-${searchTerm}-${scale}`}
  pageNumber={page}
  scale={scale}
  width={size.width - 160}  
  renderTextLayer={true}
  renderAnnotationLayer={false}
  customTextRenderer={customTextRenderer}
/>
        </Document>
      </div>
      {/* <Document
  file={pdfUrl}
  onLoadSuccess={(pdf) => {
    setPdfDoc(pdf);
    setNumPages(pdf.numPages);
    setInputPage("1");
  }}
>
  {Array.from({ length: numPages }, (_, i) => (
    <div
      key={i + 1}
      id={`page-${i + 1}`}
      className="flex justify-center mb-4"
    >
      <Page
        pageNumber={i + 1}
        scale={scale}
        width={size.width - 160}
        renderTextLayer
        renderAnnotationLayer={false}
        customTextRenderer={customTextRenderer}
      />
    </div>
  ))}
</Document> */}
{/* PAGE STRIP */}
{/* HORIZONTAL SCROLL NAVIGATOR */}
{numPages > 1 && (
  <div
    ref={scrollbarRef}
    onScroll={(e) => {
      if (isScrollingFromCode.current) return;
      const el = e.currentTarget;
      const ratio = el.scrollLeft / (el.scrollWidth - el.clientWidth);
      const newPage = Math.round(ratio * (numPages - 1)) + 1;
      if (newPage !== page) goToPage(newPage);
    }}
    style={{
      overflowX: "scroll",
      overflowY: "hidden",
      height: "12px",
      background: "#1e2022",
      flexShrink: 0,
      cursor: "ew-resize",
    }}
  >
    {/* Width of this inner div controls scroll range — wider = smoother scrubbing */}
    <div style={{ width: `${numPages * 80}px`, height: "1px" }} />
  </div>
)}
      {/* 3. FOOTER CONTROLS */}
      <div className="flex items-center justify-between px-4 py-2 bg-black text-white text-xs border-t border-gray-800 gap-2">
        {/* Page Nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1 rounded transition-colors"
          >
            ◀ Prev
          </button>

          {/* Page number input */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={numPages}
              value={inputPage}
              onChange={handlePageInputChange}
              onBlur={handlePageInputCommit}
              onKeyDown={handlePageInputKeyDown}
              className="pdf-page-input bg-gray-800 text-white text-center font-mono rounded px-1 py-1 outline-none focus:ring-1 focus:ring-[#F6EC24] transition-all"
              style={{ width: `${Math.max(3, String(numPages).length) * 10 + 16}px` }}
            />
            <span className="text-gray-400 font-mono">/ {numPages}</span>
          </div>

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page >= numPages}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1 rounded transition-colors"
          >
            Next ▶
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.4, +(s - 0.1).toFixed(1)))} className="hover:text-[#F6EC24]">➖</button>
          <span className="w-10 text-center font-mono">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, +(s + 0.1).toFixed(1)))} className="hover:text-[#F6EC24]">➕</button>
        </div>
      </div>

      {/* 4. RESIZE HANDLE */}
      <div
        onMouseDown={handleResizeMouseDown}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "16px",
          height: "16px",
          cursor: "nwse-resize",
          background: "linear-gradient(135deg, transparent 50%, #666 50%)",
          zIndex: 1000000,
        }}
      />
    </div>,
    document.body
  );
};

export default PDFComponent;