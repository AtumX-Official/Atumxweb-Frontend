import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDraggable } from "@dnd-kit/core";
import { FiX } from "react-icons/fi";

import { Worker, Viewer, ScrollMode, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { searchPlugin } from "@react-pdf-viewer/search";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

interface CurriculumProps {
  pdfUrl: string;
  onClose: () => void;
  position: { x: number; y: number };
  title: string;
}

const Curriculum: React.FC<CurriculumProps> = ({ pdfUrl, onClose, position, title }) => {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState({ width: 550, height: 650 });
  const [isResizing, setIsResizing] = useState(false);
  const [inputPage, setInputPage] = useState("1");
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const isScrollingFromCode = useRef(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

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

  const { setNodeRef, listeners, attributes, transform } = useDraggable({
    id: "pdf-viewer",
    disabled: isResizing,
  });

  // ---- Plugins ----
  const searchPluginInstance = searchPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();  const { highlight, jumpToNextMatch, jumpToPreviousMatch, clearHighlights } = searchPluginInstance;

  const { jumpToPage } = pageNavigationPluginInstance;

  const { zoomTo, CurrentScale, zoomTo: setZoom } = zoomPluginInstance;
  const [scale, setScale] = useState(1.0);

  // ---- Resize handle ----
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
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

  // ---- Zoom ----
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2.0;
  
  const applyZoom = (newScale: number) => {
      const clamped = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);
  
      setScale(clamped);
      zoomTo(clamped);
  };
  const zoomIn = () => applyZoom(scale + 0.1);
  const zoomOut = () => applyZoom(scale - 0.1);

  const handleWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey) return;

    e.preventDefault();

    const step = 0.1;

    applyZoom(scale + (e.deltaY < 0 ? step : -step));
};

  // ---- Page navigation ----
  const goToPage = (targetPage: number) => {
    if (!numPages) return;
    const clamped = Math.min(Math.max(targetPage, 1), numPages);
    jumpToPage(clamped - 1); // plugin is zero-indexed
    setPage(clamped);
    setInputPage(String(clamped));
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handlePageInputCommit = () => {
    const parsed = Number(inputPage);
    if (!Number.isNaN(parsed)) {
      goToPage(parsed);
    } else {
      setInputPage(String(page));
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handlePageInputCommit();
  };

  // Keep the input + scrubber in sync whenever the page changes externally
  useEffect(() => {
    setInputPage(String(page));
    if (scrollbarRef.current && numPages > 1) {
      isScrollingFromCode.current = true;
      const el = scrollbarRef.current;
      const ratio = (page - 1) / (numPages - 1);
      el.scrollLeft = ratio * (el.scrollWidth - el.clientWidth);
      // release the guard on the next tick
      requestAnimationFrame(() => {
        isScrollingFromCode.current = false;
      });
    }
  }, [page, numPages]);

  // ---- Search ----
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
        clearHighlights();
        setTotalResults(0);
        setCurrentResultIndex(0);
        return;
    }

    const matches = await highlight(searchTerm);

    const count = matches?.length ?? 0;

    setTotalResults(count);
    setCurrentResultIndex(count ? 1 : 0);

    // Automatically jump to first match
    if (count > 0) {
        jumpToNextMatch();
    }
};
const handleSearchKeyDown = async (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  if (e.key !== "Enter") return;

  e.preventDefault();

  if (totalResults > 0) {
      handleNextMatch();
  } else {
      await handleSearch();
  }
};
const scrollHighlightedToCenter = () => {
  setTimeout(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollBy({
              top: -180, // Adjust this value (100–200px) to get the desired gap
              behavior: "smooth",
          });
      }
  }, 100);
};


const handleNextMatch = () => {
  if (!totalResults) return;

  jumpToNextMatch();
  scrollHighlightedToCenter();

  setCurrentResultIndex((prev) =>
      prev >= totalResults ? 1 : prev + 1
  );
};

const handlePrevMatch = () => {
  if (!totalResults) return;

  jumpToPreviousMatch();
  scrollHighlightedToCenter();

  setCurrentResultIndex((prev) =>
      prev <= 1 ? totalResults : prev - 1
  );
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
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}

            placeholder="Search..."
            className="h-7 px-2 text-xs rounded border"
          />

          <button onClick={handleSearch} className="bg-black text-white px-2 py-1 rounded text-xs">
            Search
          </button>

          <button onClick={handlePrevMatch} disabled={!totalResults} className="disabled:opacity-40">
            ▲
          </button>

          <button onClick={handleNextMatch} disabled={!totalResults} className="disabled:opacity-40">
            ▼
          </button>

          <span className="text-xs whitespace-nowrap">
            {totalResults ? `${currentResultIndex}/${totalResults}` : "0/0"}
          </span>
        </div>
        <button onClick={onClose} title="Close" className="bg-[#EA221F] rounded w-6 h-6 flex items-center justify-center">
          <FiX className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* 2. PDF VIEWPORT */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex-1 bg-[#323639] pdf-scroll"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          minHeight: 0,
        }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            scrollMode={ScrollMode.Vertical}
            defaultScale={SpecialZoomLevel.PageWidth}
            plugins={[searchPluginInstance, pageNavigationPluginInstance, zoomPluginInstance]}
            onDocumentLoad={(e) => setNumPages(e.doc.numPages)}
            onPageChange={(e) => setPage(e.currentPage + 1)}
            onZoom={(e) => setScale(e.scale)}
          />
        </Worker>
      </div>

      {numPages > 1 && (
        <div
          ref={scrollbarRef}
          className="pdf-scroll-nav"
          onScroll={(e) => {
            if (isScrollingFromCode.current) return;
            const el = e.currentTarget;
            const ratio = el.scrollLeft / (el.scrollWidth - el.clientWidth || 1);
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
          <button onClick={zoomOut} disabled={scale <= 0.5} className="hover:text-[#F6EC24]">➖</button>
          <span className="w-10 text-center font-mono">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={scale >= 2} className="hover:text-[#F6EC24]">➕</button>
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

export default Curriculum;