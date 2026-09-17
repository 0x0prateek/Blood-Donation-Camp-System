/**
 * Blood Donor Management System — Global JavaScript
 * Handles sidebar, AJAX setup, toasts, and common utilities.
 */

$(document).ready(function () {

    // ── AJAX Global Setup ────────────────────────────────
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': window.CSRF_TOKEN || ''
        },
        error: function (xhr, status, error) {
            let msg = 'An unexpected error occurred.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                msg = xhr.responseJSON.message;
            } else if (xhr.status === 0) {
                msg = 'Unable to connect to server.';
            } else if (xhr.status === 403) {
                msg = 'Access denied. Please login again.';
                setTimeout(() => { window.location.href = window.BASE_URL + '/login.php'; }, 1500);
            } else if (xhr.status === 500) {
                msg = 'Server error. Please try again later.';
            }
            showToast(msg, 'error');
        }
    });

    // ── Sidebar Toggle ───────────────────────────────────
    const $sidebar = $('#sidebar');
    const $mainContent = $('#mainContent');
    const $overlay = $('<div class="sidebar-overlay" id="sidebarOverlay"></div>');
    $('body').append($overlay);

    $('#sidebarToggle').on('click', function () {
        if (window.innerWidth < 992) {
            $sidebar.toggleClass('show');
            $overlay.toggleClass('show');
        } else {
            $sidebar.toggleClass('collapsed');
            $mainContent.toggleClass('expanded');
        }
    });

    $('#sidebarClose, #sidebarOverlay').on('click', function () {
        $sidebar.removeClass('show');
        $overlay.removeClass('show');
    });

    // Close sidebar on resize to desktop
    $(window).on('resize', function () {
        if (window.innerWidth >= 992) {
            $sidebar.removeClass('show');
            $overlay.removeClass('show');
        }
    });

    // ── Tooltips ─────────────────────────────────────────
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(el => new bootstrap.Tooltip(el));
});

// ═══════════════════════════════════════════════════════════
// TOAST NOTIFICATION SYSTEM (SweetAlert2)
// ═══════════════════════════════════════════════════════════

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
});

/**
 * Show a toast notification.
 * @param {string} message
 * @param {string} type - 'success', 'error', 'warning', 'info'
 */
function showToast(message, type = 'success') {
    Toast.fire({
        icon: type,
        title: message
    });
}

// ═══════════════════════════════════════════════════════════
// CONFIRMATION DIALOG
// ═══════════════════════════════════════════════════════════

/**
 * Show a confirmation dialog.
 * @param {string} title
 * @param {string} text
 * @param {string} confirmText
 * @param {string} type - 'warning', 'danger'
 * @returns {Promise}
 */
function confirmAction(title, text, confirmText = 'Yes, proceed', type = 'warning') {
    return Swal.fire({
        title: title,
        text: text,
        icon: type === 'danger' ? 'error' : 'warning',
        showCancelButton: true,
        confirmButtonColor: type === 'danger' ? '#ef4444' : '#6366f1',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        customClass: {
            popup: 'animate__animated animate__fadeIn'
        }
    });
}

// ═══════════════════════════════════════════════════════════
// FORM UTILITIES
// ═══════════════════════════════════════════════════════════

/**
 * Serialize form to object.
 */
function formToObject($form) {
    const data = {};
    $form.serializeArray().forEach(item => {
        data[item.name] = item.value;
    });
    return data;
}

/**
 * Reset form and clear validation states.
 */
function resetForm($form) {
    $form[0].reset();
    $form.find('.is-invalid').removeClass('is-invalid');
    $form.find('.invalid-feedback').text('');
}

/**
 * Show validation errors on form fields.
 */
function showValidationErrors($form, errors) {
    // Clear previous
    $form.find('.is-invalid').removeClass('is-invalid');

    for (const [field, message] of Object.entries(errors)) {
        const $field = $form.find(`[name="${field}"]`);
        $field.addClass('is-invalid');
        $field.siblings('.invalid-feedback').text(message);
    }
}

/**
 * Set button loading state.
 */
function setButtonLoading($btn, loading = true) {
    if (loading) {
        $btn.data('original-text', $btn.html());
        $btn.html('<span class="spinner-border spinner-border-sm me-1"></span> Processing...');
        $btn.prop('disabled', true);
    } else {
        $btn.html($btn.data('original-text'));
        $btn.prop('disabled', false);
    }
}

// ═══════════════════════════════════════════════════════════
// DATA TABLE DEFAULTS
// ═══════════════════════════════════════════════════════════

if ($.fn.dataTable) {
    $.extend(true, $.fn.dataTable.defaults, {
        language: {
            search: '',
            searchPlaceholder: 'Search...',
            lengthMenu: 'Show _MENU_ entries',
            info: 'Showing _START_ to _END_ of _TOTAL_ entries',
            emptyTable: '<div class="empty-state py-4"><i class="fas fa-inbox d-block"></i><p class="mb-0 mt-2">No data available</p></div>',
            zeroRecords: '<div class="empty-state py-4"><i class="fas fa-search d-block"></i><p class="mb-0 mt-2">No matching records found</p></div>'
        },
        pageLength: 25,
        responsive: true,
        dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip'
    });
}

// ═══════════════════════════════════════════════════════════
// NUMBER ANIMATION (for dashboard counters)
// ═══════════════════════════════════════════════════════════

/**
 * Animate a number from 0 to target.
 * @param {HTMLElement} element
 * @param {number} target
 * @param {number} duration ms
 */
function animateNumber(element, target, duration = 1000) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start).toLocaleString();
        }
    }, 16);
}

// Animate all stat values on page load
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.stat-value[data-count]').forEach(el => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        if (!isNaN(target)) {
            animateNumber(el, target);
        }
    });
});

// ── Chunked campaign sending ─────────────────────────────────
//
// Sending used to be one request that looped every recipient, each with
// an outbound API call. At 488 donors that cannot finish inside PHP's
// max_execution_time: the request died part-way, some donors got the
// message, some did not, and the operator saw no summary at all.
//
// The browser now walks the list a chunk at a time. Every run carries a
// campaign id, so a chunk that fails can be retried without re-sending
// to everyone already contacted.

/**
 * A campaign id: 32 hex characters, matching what the server accepts.
 */
function newCampaignId() {
    const bytes = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Post a campaign in chunks until the server reports it is finished.
 *
 * @param {string}   url        send-sms.php or send-whatsapp.php
 * @param {string}   formData   serialized form, without offset/campaign_id
 * @param {object}   handlers   { onProgress, onDone, onError }
 */
function sendCampaign(url, formData, handlers) {
    handlers = handlers || {};

    const campaignId = newCampaignId();
    const totals = { sent: 0, pending: 0, failed: 0, skipped: 0 };

    function step(offset) {
        const payload = formData
            + '&campaign_id=' + encodeURIComponent(campaignId)
            + '&offset=' + offset;

        $.post(url, payload, function (res) {
            if (!res.success) {
                if (handlers.onError) handlers.onError(res.message, totals);
                return;
            }

            const d = res.data || {};
            totals.sent    += d.sent    || 0;
            totals.pending += d.pending || 0;
            totals.failed  += d.failed  || 0;
            totals.skipped += d.skipped || 0;

            if (handlers.onProgress) {
                handlers.onProgress(d.processed || 0, d.total || 0, totals);
            }

            if (d.done || d.next_offset === null || d.next_offset === undefined) {
                if (handlers.onDone) handlers.onDone(totals, d.total || 0, campaignId);
                return;
            }

            step(d.next_offset);
        }, 'json').fail(function (xhr) {
            // A chunk failing is recoverable: everything already sent is
            // recorded under this campaign id, so retrying resumes rather
            // than starting over. Tell the operator where it stopped.
            const msg = 'Sending stopped at recipient ' + offset +
                '. Nothing already sent will be sent twice if you try again.' +
                (xhr && xhr.status ? ' (HTTP ' + xhr.status + ')' : '');
            if (handlers.onError) handlers.onError(msg, totals);
        });
    }

    step(0);
}

/**
 * Human summary of a finished campaign.
 */
function campaignSummary(totals, total) {
    const parts = [totals.sent + ' sent'];
    if (totals.failed)  parts.push(totals.failed + ' failed');
    if (totals.pending) parts.push(totals.pending + ' pending');
    if (totals.skipped) parts.push(totals.skipped + ' already sent');
    return parts.join(', ') + ' of ' + total + '.';
}
