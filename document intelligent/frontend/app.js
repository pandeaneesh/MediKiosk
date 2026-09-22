/**
 * MediKiosk Medical Document Intelligence (MDI)
 * Explainable Clinical OCR, Source Grounding, and Redis Pipeline Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const redisModeText = document.getElementById("redisModeText");
  const currentDocId = document.getElementById("currentDocId");
  const progressPercentage = document.getElementById("progressPercentage");
  const progressFill = document.getElementById("progressFill");
  const pipelineCaption = document.getElementById("pipelineCaption");
  
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  
  const documentImage = document.getElementById("documentImage");
  const bboxOverlay = document.getElementById("bboxOverlay");
  const docTypePill = document.getElementById("docTypePill");
  const btnToggleBoxes = document.getElementById("btnToggleBoxes");
  const btnResetZoom = document.getElementById("btnResetZoom");
  const canvasWrapper = document.getElementById("canvasWrapper");

  const medicationsList = document.getElementById("medicationsList");
  const investigationsList = document.getElementById("investigationsList");
  const vitalsList = document.getElementById("vitalsList");
  const timelineContainer = document.getElementById("timelineContainer");
  const summaryContent = document.getElementById("summaryContent");
  const btnCopySummary = document.getElementById("btnCopySummary");
  
  const countMeds = document.getElementById("countMeds");
  const countLabs = document.getElementById("countLabs");
  const countVitals = document.getElementById("countVitals");
  
  const verificationAlert = document.getElementById("verificationAlert");
  const unverifiedCountText = document.getElementById("unverifiedCountText");

  // Modal Elements
  const editModal = document.getElementById("editModal");
  const btnModalClose = document.getElementById("btnModalClose");
  const btnModalCancel = document.getElementById("btnModalCancel");
  const btnModalSave = document.getElementById("btnModalSave");
  const modalInputName = document.getElementById("modalInputName");
  const modalInputDose = document.getElementById("modalInputDose");
  const modalInputFreq = document.getElementById("modalInputFreq");
  const modalInputValue = document.getElementById("modalInputValue");
  const modalInputUnit = document.getElementById("modalInputUnit");
  const modalMedRow = document.getElementById("modalMedRow");
  const modalLabRow = document.getElementById("modalLabRow");
  const modalSourceText = document.getElementById("modalSourceText");

  // State
  let activeDocId = null;
  let activeResultData = null;
  let statusPollInterval = null;
  let showBBoxes = true;
  let currentEditingItem = null;

  // Step IDs in pipeline
  const pipelineSteps = [
    "uploaded",
    "preprocessing",
    "ocr_processing",
    "extracting_entities",
    "generating_summary",
  ];

  // 1. Initial Health Check & AI Engine Status
  async function checkHealth() {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        redisModeText.textContent = data.mode.includes("Live") ? "Live Redis Daemon" : "High-Speed Redis Engine";
      }
      await refreshAIStatus();
    } catch (e) {
      console.warn("Health check error:", e);
    }
  }
  checkHealth();

  // 2. Tab Navigation
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const targetTab = document.getElementById(btn.dataset.tab);
      if (targetTab) targetTab.classList.add("active");

      if (btn.dataset.tab === "tab-timeline") {
        fetchTimeline();
      }
    });
  });

  // 3. File Upload & Drag-and-Drop
  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  });

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    resetPipelineUI("Uploading document to Redis queue...");

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Upload error: ${err.detail || 'Failed to upload'}`);
        return;
      }

      const data = await res.json();
      activeDocId = data.document_id;
      currentDocId.textContent = activeDocId;
      startStatusPolling(activeDocId);
    } catch (e) {
      console.error("Upload failed:", e);
      alert("Network or server error during upload.");
    }
  }

  // 4. Demo Presets
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const sampleId = btn.dataset.sample;
      resetPipelineUI(`Loading sample '${sampleId}' into Redis pipeline...`);
      try {
        const res = await fetch(`/api/samples/${sampleId}/load`, { method: "POST" });
        if (!res.ok) {
          alert("Failed to load sample document");
          return;
        }
        const data = await res.json();
        activeDocId = data.document_id;
        currentDocId.textContent = activeDocId;
        startStatusPolling(activeDocId);
      } catch (e) {
        console.error("Error loading sample:", e);
      }
    });
  });

  // 5. Redis Real-time Status Polling
  function startStatusPolling(docId) {
    if (statusPollInterval) clearInterval(statusPollInterval);

    statusPollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/documents/${docId}/status`);
        if (!res.ok) return;
        const status = await res.json();

        updateProgressUI(status);

        if (status.status === "completed") {
          clearInterval(statusPollInterval);
          statusPollInterval = null;
          fetchDocumentResult(docId);
        } else if (status.status === "failed") {
          clearInterval(statusPollInterval);
          statusPollInterval = null;
          pipelineCaption.textContent = `❌ Error: ${status.details || 'Pipeline failed'}`;
        }
      } catch (e) {
        console.warn("Polling status error:", e);
      }
    }, 400);
  }

  function resetPipelineUI(initialCaption) {
    progressPercentage.textContent = "10%";
    progressFill.style.width = "10%";
    pipelineCaption.textContent = initialCaption;
    pipelineSteps.forEach(st => {
      const el = document.getElementById(`step-${st}`);
      if (el) el.className = "step-item";
    });
    const step1 = document.getElementById("step-uploaded");
    if (step1) step1.classList.add("active");
  }

  function updateProgressUI(status) {
    const progress = status.progress || 10;
    progressPercentage.textContent = `${progress}%`;
    progressFill.style.width = `${progress}%`;
    pipelineCaption.textContent = status.details ? `${status.stage} — ${status.details}` : status.stage;

    const currentIdx = pipelineSteps.indexOf(status.status);
    pipelineSteps.forEach((st, idx) => {
      const el = document.getElementById(`step-${st}`);
      if (!el) return;
      if (status.status === "completed" || idx < currentIdx) {
        el.className = "step-item completed";
      } else if (idx === currentIdx) {
        el.className = "step-item active";
      } else {
        el.className = "step-item";
      }
    });
  }

  // 6. Fetch Full Extraction Result
  async function fetchDocumentResult(docId) {
    try {
      const res = await fetch(`/api/documents/${docId}/result`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.status === "completed" && json.result) {
        activeResultData = json.result;
        renderDocumentResult(activeResultData);
      }
    } catch (e) {
      console.error("Failed to fetch document result:", e);
    }
  }

  // 7. Render Document Result & Source Grounding
  function renderDocumentResult(data) {
    // 1. Classification
    const docType = data.document_type || "PRESCRIPTION";
    const docConf = Math.round((data.document_type_confidence || 0.95) * 100);
    docTypePill.textContent = `${docType.replace("_", " ")} (${docConf}%)`;

    // 2. Patient & Diagnosis Info Header
    const patientHeader = document.getElementById("patientCardHeader");
    const patientNameText = document.getElementById("patientNameText");
    const patientSubText = document.getElementById("patientSubText");
    const diagnosisTag = document.getElementById("diagnosisTag");
    const facilityText = document.getElementById("facilityText");

    const pInfo = data.extracted_entities?.patient_info || {};
    const diagList = data.extracted_entities?.diagnosis || [];

    if (pInfo.name || diagList.length > 0 || pInfo.clinic_hospital) {
      patientHeader.style.display = "block";
      patientNameText.textContent = pInfo.name ? `Patient: ${pInfo.name}` : "Patient Record";
      
      const subParts = [];
      if (pInfo.age) subParts.push(`Age: ${pInfo.age}`);
      if (pInfo.gender) subParts.push(`Gender: ${pInfo.gender}`);
      if (pInfo.date || data.extracted_entities?.document_date) {
        subParts.push(`Date: ${pInfo.date || data.extracted_entities?.document_date}`);
      }
      if (pInfo.uhid) subParts.push(`UHID/IP: ${pInfo.uhid}`);
      if (pInfo.doctor_reg) subParts.push(`Doc Reg: ${pInfo.doctor_reg}`);
      patientSubText.textContent = subParts.length > 0 ? subParts.join(" • ") : "Clinical Record Details";

      if (diagList.length > 0) {
        diagnosisTag.textContent = `Diagnosis: ${diagList[0].condition || diagList[0]}`;
        diagnosisTag.style.display = "inline-block";
      } else {
        diagnosisTag.textContent = "Medical Evaluation";
      }

      if (pInfo.clinic_hospital) {
        facilityText.textContent = pInfo.clinic_hospital + (pInfo.address ? ` (${pInfo.address})` : '');
      } else {
        facilityText.textContent = "Healthcare Center / Clinic";
      }
    } else {
      patientHeader.style.display = "none";
    }

    // 3. Load Image
    const imageUrl = `/api/files/uploads/${data.image_filename}`;
    documentImage.src = imageUrl;

    documentImage.onload = () => {
      renderBoundingBoxes(data);
    };

    // 4. Render Lists
    renderMedications(data.extracted_entities?.medications || []);
    renderInvestigations(data.extracted_entities?.investigations || []);
    renderVitals(data.extracted_entities?.vitals || []);
    renderSummary(data.summary?.summary_text || "");

    // 5. Verification Safeguard Banner
    const unverified = data.unverified_items || [];
    if (unverified.length > 0) {
      verificationAlert.style.display = "flex";
      unverifiedCountText.textContent = unverified.length;
    } else {
      verificationAlert.style.display = "none";
    }
  }

  // 8. Render Bounding Boxes Overlay
  function renderBoundingBoxes(data) {
    bboxOverlay.innerHTML = "";
    if (!showBBoxes) return;

    const imgW = documentImage.naturalWidth;
    const imgH = documentImage.naturalHeight;
    if (!imgW || !imgH) return;

    // We render bounding boxes for all extracted entities
    const allEntities = [];

    (data.extracted_entities?.medications || []).forEach((m, idx) => {
      if (m.source?.bbox) {
        allEntities.push({
          type: "medication",
          index: idx,
          name: m.name,
          bbox: m.source.bbox,
          needsVerification: m.needs_verification,
        });
      }
    });

    (data.extracted_entities?.investigations || []).forEach((l, idx) => {
      if (l.source?.bbox) {
        allEntities.push({
          type: "investigation",
          index: idx,
          name: l.name,
          bbox: l.source.bbox,
          needsVerification: l.needs_verification,
        });
      }
    });

    (data.extracted_entities?.vitals || []).forEach((v, idx) => {
      if (v.source?.bbox) {
        allEntities.push({
          type: "vital",
          index: idx,
          name: v.name,
          bbox: v.source.bbox,
          needsVerification: v.needs_verification,
        });
      }
    });

    allEntities.forEach((item) => {
      const [x1, y1, x2, y2] = item.bbox;
      if (x2 <= x1 || y2 <= y1) return;

      const leftPct = (x1 / imgW) * 100;
      const topPct = (y1 / imgH) * 100;
      const widthPct = ((x2 - x1) / imgW) * 100;
      const heightPct = ((y2 - y1) / imgH) * 100;

      const boxEl = document.createElement("div");
      boxEl.className = `bbox-rect ${item.needsVerification ? 'bbox-warning' : ''}`;
      boxEl.id = `bbox-${item.type}-${item.index}`;
      boxEl.style.left = `${leftPct}%`;
      boxEl.style.top = `${topPct}%`;
      boxEl.style.width = `${widthPct}%`;
      boxEl.style.height = `${heightPct}%`;
      boxEl.title = `${item.name} (${item.type})`;

      // Hover / Click interaction
      boxEl.addEventListener("mouseenter", () => highlightEntityCard(item.type, item.index));
      boxEl.addEventListener("mouseleave", () => unhighlightEntityCard(item.type, item.index));
      boxEl.addEventListener("click", () => {
        // Switch to the appropriate tab and scroll into view
        const targetTabBtn = document.querySelector(`[data-tab="tab-${item.type === 'medication' ? 'meds' : item.type === 'investigation' ? 'labs' : 'vitals'}"]`);
        if (targetTabBtn) targetTabBtn.click();
        const card = document.getElementById(`card-${item.type}-${item.index}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add("highlighted");
          setTimeout(() => card.classList.remove("highlighted"), 2000);
        }
      });

      bboxOverlay.appendChild(boxEl);
    });
  }

  // Toggle Bounding Boxes
  btnToggleBoxes.addEventListener("click", () => {
    showBBoxes = !showBBoxes;
    btnToggleBoxes.classList.toggle("active", showBBoxes);
    if (activeResultData) {
      renderBoundingBoxes(activeResultData);
    }
  });

  // Reset Zoom / Scroll
  btnResetZoom.addEventListener("click", () => {
    canvasWrapper.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  });

  // Source-Grounded Highlighting Handlers
  function highlightBBox(type, index) {
    const box = document.getElementById(`bbox-${type}-${index}`);
    if (box) {
      box.classList.add("highlighted");
      box.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }
  }

  function unhighlightBBox(type, index) {
    const box = document.getElementById(`bbox-${type}-${index}`);
    if (box) box.classList.remove("highlighted");
  }

  function highlightEntityCard(type, index) {
    const card = document.getElementById(`card-${type}-${index}`);
    if (card) card.classList.add("highlighted");
  }

  function unhighlightEntityCard(type, index) {
    const card = document.getElementById(`card-${type}-${index}`);
    if (card) card.classList.remove("highlighted");
  }

  // 9. Render Medications Tab
  function renderMedications(meds) {
    medicationsList.innerHTML = "";
    countMeds.textContent = meds.length;

    if (meds.length === 0) {
      medicationsList.innerHTML = `<div class="empty-state">No medications detected in document.</div>`;
      return;
    }

    meds.forEach((m, idx) => {
      const conf = Math.round((m.confidence || 0.85) * 100);
      const confClass = conf >= 90 ? "conf-high" : conf >= 80 ? "conf-mid" : "conf-low";

      const card = document.createElement("div");
      card.className = `entity-card ${m.needs_verification ? 'card-warning' : ''}`;
      card.id = `card-medication-${idx}`;

      card.innerHTML = `
        <div class="entity-info-left">
          <div class="entity-title-row">
            <span class="entity-name">${escapeHtml(m.name)}</span>
            <span class="confidence-tag ${confClass}">${conf}% Conf</span>
          </div>
          <div class="entity-details-row">
            <span class="badge-tag">Dose: ${escapeHtml(m.dose || 'Standard')}</span>
            <span class="badge-tag">Freq: ${escapeHtml(m.frequency || '1-0-1')}</span>
            ${m.source_text ? `<span class="source-grounding-hint">🎯 "${escapeHtml(m.source_text)}"</span>` : ''}
          </div>
        </div>
        <div class="entity-actions-right">
          ${m.needs_verification ? `
            <button class="btn-verify-action" data-action="verify-med" data-idx="${idx}">
              ⚠️ Verify
            </button>
          ` : `
            <span class="verified-badge">✓ Confirmed</span>
          `}
        </div>
      `;

      card.addEventListener("mouseenter", () => highlightBBox("medication", idx));
      card.addEventListener("mouseleave", () => unhighlightBBox("medication", idx));

      // Verify button click
      const verifyBtn = card.querySelector(`[data-action="verify-med"]`);
      if (verifyBtn) {
        verifyBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openEditModal("medication", idx, m);
        });
      }

      medicationsList.appendChild(card);
    });
  }

  // 10. Render Investigations Tab
  function renderInvestigations(labs) {
    investigationsList.innerHTML = "";
    countLabs.textContent = labs.length;

    if (labs.length === 0) {
      investigationsList.innerHTML = `<div class="empty-state">No laboratory investigations detected.</div>`;
      return;
    }

    labs.forEach((l, idx) => {
      const conf = Math.round((l.confidence || 0.90) * 100);
      const confClass = conf >= 90 ? "conf-high" : conf >= 80 ? "conf-mid" : "conf-low";

      const card = document.createElement("div");
      card.className = `entity-card ${l.needs_verification ? 'card-warning' : ''}`;
      card.id = `card-investigation-${idx}`;

      card.innerHTML = `
        <div class="entity-info-left">
          <div class="entity-title-row">
            <span class="entity-name">${escapeHtml(l.name)}</span>
            <span class="confidence-tag ${confClass}">${conf}% Conf</span>
          </div>
          <div class="entity-details-row">
            <span class="badge-tag">Value: <strong style="color:#fff">${escapeHtml(l.value)} ${escapeHtml(l.unit || '')}</strong></span>
            ${l.reference_range ? `<span class="badge-tag">Ref: ${escapeHtml(l.reference_range)}</span>` : ''}
          </div>
        </div>
        <div class="entity-actions-right">
          ${l.needs_verification ? `
            <button class="btn-verify-action" data-action="verify-lab" data-idx="${idx}">
              ⚠️ Verify
            </button>
          ` : `
            <span class="verified-badge">✓ Verified</span>
          `}
        </div>
      `;

      card.addEventListener("mouseenter", () => highlightBBox("investigation", idx));
      card.addEventListener("mouseleave", () => unhighlightBBox("investigation", idx));

      const verifyBtn = card.querySelector(`[data-action="verify-lab"]`);
      if (verifyBtn) {
        verifyBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openEditModal("investigation", idx, l);
        });
      }

      investigationsList.appendChild(card);
    });
  }

  // 11. Render Vitals Tab
  function renderVitals(vitals) {
    vitalsList.innerHTML = "";
    countVitals.textContent = vitals.length;

    if (vitals.length === 0) {
      vitalsList.innerHTML = `<div class="empty-state">No vitals documented in this record.</div>`;
      return;
    }

    vitals.forEach((v, idx) => {
      const conf = Math.round((v.confidence || 0.95) * 100);
      const card = document.createElement("div");
      card.className = "entity-card";
      card.id = `card-vital-${idx}`;

      card.innerHTML = `
        <div class="entity-info-left">
          <div class="entity-title-row">
            <span class="entity-name">${escapeHtml(v.name)}</span>
            <span class="confidence-tag conf-high">${conf}% Conf</span>
          </div>
          <div class="entity-details-row">
            <span class="badge-tag">Reading: <strong style="color:#fff">${escapeHtml(v.value)} ${escapeHtml(v.unit || '')}</strong></span>
          </div>
        </div>
        <div class="entity-actions-right">
          <span class="verified-badge">✓ Grounded</span>
        </div>
      `;

      card.addEventListener("mouseenter", () => highlightBBox("vital", idx));
      card.addEventListener("mouseleave", () => unhighlightBBox("vital", idx));

      vitalsList.appendChild(card);
    });
  }

  // 12. Render Summary
  function renderSummary(summaryText) {
    summaryContent.textContent = summaryText || "Summary awaiting document completion.";
  }

  // Copy Summary to Clipboard
  btnCopySummary.addEventListener("click", () => {
    navigator.clipboard.writeText(summaryContent.textContent).then(() => {
      btnCopySummary.innerHTML = `<span>✓</span> Copied to Clipboard!`;
      setTimeout(() => {
        btnCopySummary.innerHTML = `<span>📋</span> Copy Clinical Summary`;
      }, 2000);
    });
  });

  // 13. Clinical Timeline Fetch & Render
  async function fetchTimeline() {
    try {
      const res = await fetch("/api/timeline");
      if (!res.ok) return;
      const data = await res.json();
      renderTimeline(data.timeline || []);
    } catch (e) {
      console.error("Failed to load timeline:", e);
    }
  }

  function renderTimeline(events) {
    timelineContainer.innerHTML = "";
    if (events.length === 0) {
      timelineContainer.innerHTML = `<p class="empty-state">No chronological events found.</p>`;
      return;
    }

    events.forEach(ev => {
      const card = document.createElement("div");
      card.className = "timeline-event-card";
      card.innerHTML = `
        <div class="timeline-node"></div>
        <div class="timeline-header">
          <span class="timeline-year-badge">${ev.year || 2026}</span>
          <span class="timeline-date">${escapeHtml(ev.date || '')}</span>
        </div>
        <h4 class="timeline-title">${escapeHtml(ev.title || 'Clinical Encounter')}</h4>
        <p class="timeline-summary">${escapeHtml(ev.summary || '')}</p>
      `;
      timelineContainer.appendChild(card);
    });
  }

  // 14. Doctor Verification Modal Logic
  function openEditModal(entityType, index, data) {
    currentEditingItem = { entityType, index };
    modalInputName.value = data.name || "";
    modalSourceText.textContent = data.source_text || data.source?.text || "Document text snippet";

    if (entityType === "medication") {
      modalMedRow.style.display = "flex";
      modalLabRow.style.display = "none";
      modalInputDose.value = data.dose || "";
      modalInputFreq.value = data.frequency || "";
    } else {
      modalMedRow.style.display = "none";
      modalLabRow.style.display = "flex";
      modalInputValue.value = data.value || "";
      modalInputUnit.value = data.unit || "";
    }

    editModal.style.display = "flex";
  }

  function closeModal() {
    editModal.style.display = "none";
    currentEditingItem = null;
  }

  btnModalClose.addEventListener("click", closeModal);
  btnModalCancel.addEventListener("click", closeModal);

  btnModalSave.addEventListener("click", async () => {
    if (!currentEditingItem || !activeDocId) return;

    const payload = {
      entity_type: currentEditingItem.entityType,
      index: currentEditingItem.index,
      name: modalInputName.value.trim(),
      dose: modalInputDose.value.trim(),
      frequency: modalInputFreq.value.trim(),
      value: modalInputValue.value.trim(),
      unit: modalInputUnit.value.trim(),
      verified: true,
    };

    try {
      const res = await fetch(`/api/documents/${activeDocId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        activeResultData = data.result;
        renderDocumentResult(activeResultData);
        closeModal();
      } else {
        alert("Failed to save verification.");
      }
    } catch (e) {
      console.error("Verification error:", e);
    }
  });

  // Utility to prevent XSS
  function escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Multimodal AI Vision Key Management
  const btnOpenAISettings = document.getElementById("btnOpenAISettings");
  const aiSettingsModal = document.getElementById("aiSettingsModal");
  const btnAISettingsClose = document.getElementById("btnAISettingsClose");
  const aiEngineBadgeText = document.getElementById("aiEngineBadgeText");
  const aiEngineCurrentMode = document.getElementById("aiEngineCurrentMode");
  const inputGeminiApiKey = document.getElementById("inputGeminiApiKey");
  const aiKeyStatusFeedback = document.getElementById("aiKeyStatusFeedback");
  const btnSaveAIKey = document.getElementById("btnSaveAIKey");
  const btnDisableAIKey = document.getElementById("btnDisableAIKey");

  async function refreshAIStatus() {
    try {
      const res = await fetch("/api/config/ai-status");
      if (!res.ok) return;
      const data = await res.json();
      if (aiEngineBadgeText) {
        aiEngineBadgeText.textContent = data.configured ? "Gemini Vision AI (Active)" : "Neural OCR + Pharmacopoeia";
      }
      if (aiEngineCurrentMode) {
        aiEngineCurrentMode.textContent = data.mode;
        aiEngineCurrentMode.style.color = data.configured ? "#10b981" : "#38bdf8";
      }
      if (inputGeminiApiKey && data.masked_key) {
        inputGeminiApiKey.placeholder = `Active Key: ${data.masked_key}`;
      }
    } catch (e) {
      console.warn("AI status error:", e);
    }
  }

  if (btnOpenAISettings && aiSettingsModal) {
    btnOpenAISettings.addEventListener("click", () => {
      refreshAIStatus();
      aiSettingsModal.style.display = "flex";
      if (aiKeyStatusFeedback) aiKeyStatusFeedback.textContent = "";
    });

    if (btnAISettingsClose) {
      btnAISettingsClose.addEventListener("click", () => {
        aiSettingsModal.style.display = "none";
      });
    }

    if (btnSaveAIKey) {
      btnSaveAIKey.addEventListener("click", async () => {
        const keyVal = inputGeminiApiKey.value.trim();
        if (!keyVal) {
          aiKeyStatusFeedback.innerHTML = `<span style="color: #f87171;">Please enter a valid Gemini API key (starts with AIzaSy)</span>`;
          return;
        }

        aiKeyStatusFeedback.innerHTML = `<span style="color: #38bdf8;">Validating & activating key...</span>`;
        try {
          const res = await fetch("/api/config/ai-key", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_key: keyVal }),
          });
          const result = await res.json();
          if (result.success) {
            aiKeyStatusFeedback.innerHTML = `<span style="color: #4ade80;">✓ ${result.message}</span>`;
            inputGeminiApiKey.value = "";
            refreshAIStatus();
            setTimeout(() => {
              aiSettingsModal.style.display = "none";
            }, 1200);
          } else {
            aiKeyStatusFeedback.innerHTML = `<span style="color: #f87171;">❌ ${result.message}</span>`;
          }
        } catch (err) {
          aiKeyStatusFeedback.innerHTML = `<span style="color: #f87171;">Error connecting to backend</span>`;
        }
      });
    }

    if (btnDisableAIKey) {
      btnDisableAIKey.addEventListener("click", async () => {
        await fetch("/api/config/ai-key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: "" }),
        });
        aiKeyStatusFeedback.innerHTML = `<span style="color: #38bdf8;">✓ Local Neural OCR & Indian Pharmacopoeia Engine activated</span>`;
        if (inputGeminiApiKey) inputGeminiApiKey.placeholder = "AIzaSy...";
        refreshAIStatus();
        setTimeout(() => {
          aiSettingsModal.style.display = "none";
        }, 1200);
      });
    }
  }
});
