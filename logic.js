// WCAG Name, Role, Value Analyzer - Main Logic
(function() {
    'use strict';
    
    try {
        // Remove existing instances
        var existing = document.querySelectorAll('.nrv-panel, .nrv-style, .nrv-highlight');
        existing.forEach(function(el) {
            el.remove();
        });

        // Load CSS
var loadCSS = function() {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.className = 'nrv-style';
    link.href = 'https://github.com/Gowtham-Sn/Gowtham-Sn/blob/main/Bookmark.css';
    document.head.appendChild(link);
};

        // Build UI Panel
        var buildPanel = function() {
            var panel = document.createElement('div');
            panel.className = 'nrv-panel';
            
            // Close button
            var closeBtn = document.createElement('button');
            closeBtn.className = 'nrv-close';
            closeBtn.textContent = '×';
            closeBtn.onclick = function() {
                document.querySelectorAll('.nrv-panel, .nrv-style, .nrv-highlight').forEach(function(el) {
                    el.remove();
                });
            };
            panel.appendChild(closeBtn);

            // Logo
            var logo = document.createElement('img');
            logo.className = 'nrv-logo';
            logo.src = 'https://www.tsqsinc.com/static/media/logo-transparent.1f4456ea770d124c21cb.gif';
            logo.alt = 'TSQS Inc logo';
            logo.decoding = 'async';
            logo.referrerPolicy = 'no-referrer';
            panel.appendChild(logo);

            // Title
            var title = document.createElement('h3');
            title.className = 'nrv-title';
            title.textContent = '🏷️ WCAG Name, Role, Value';
            panel.appendChild(title);

            // Subtitle
            var subtitle = document.createElement('p');
            subtitle.className = 'nrv-subtitle';
            subtitle.textContent = 'Interactive elements accessibility analyzer';
            panel.appendChild(subtitle);

            // Status
            var status = document.createElement('div');
            status.className = 'nrv-status';
            status.innerHTML = '<strong>Analyzing elements...</strong>';
            panel.appendChild(status);

            // Tabs
            var tabsDiv = document.createElement('div');
            tabsDiv.className = 'nrv-tabs';
            panel.appendChild(tabsDiv);

            // Content body
            var body = document.createElement('div');
            body.className = 'nrv-section';
            panel.appendChild(body);

            document.body.appendChild(panel);
            
            return {
                root: panel,
                body: body,
                status: status,
                tabs: tabsDiv
            };
        };

        // Initialize
        loadCSS();
        var ui = buildPanel();
        
        // Start analysis
        analyzeElements(ui);
        
    } catch (error) {
        alert('WCAG Analyzer Error: ' + error.message);
    }

    // Main analysis function
    function analyzeElements(ui) {
        var interactiveSelectors = [
            'a[href]', 'button', 'input:not([type="hidden"])', 'select', 'textarea',
            '[role="button"]', '[role="link"]', '[role="tab"]', '[role="menuitem"]',
            '[role="option"]', '[role="checkbox"]', '[role="radio"]', '[role="switch"]',
            '[role="slider"]', '[role="spinbutton"]', '[role="textbox"]',
            '[role="searchbox"]', '[role="combobox"]', '[tabindex]:not([tabindex="-1"])',
            '[onclick]', '[contenteditable="true"]'
        ];

        var allElements = Array.from(document.querySelectorAll(interactiveSelectors.join(',')))
            .filter(function(el) {
                return el.offsetParent !== null || el.tagName === 'AREA';
            });

        var results = {
            failed: [],
            passed: []
        };

        // Analysis functions
        function getAccessibleName(el) {
            var name = '';
            
            if (el.hasAttribute('aria-labelledby')) {
                var ids = el.getAttribute('aria-labelledby').trim().split(/\s+/);
                name = ids.map(function(id) {
                    var refEl = document.getElementById(id);
                    return refEl ? refEl.textContent.trim() : '';
                }).filter(function(text) {
                    return text;
                }).join(' ').trim();
            } else if (el.hasAttribute('aria-label')) {
                name = el.getAttribute('aria-label').trim();
            } else if (el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'reset' || el.type === 'button')) {
                name = el.value.trim() || el.getAttribute('value') || '';
            } else if (el.tagName === 'INPUT' && el.type === 'image') {
                name = el.getAttribute('alt') || '';
            } else if (el.tagName === 'IMG') {
                name = el.getAttribute('alt') || '';
            } else if (el.id) {
                var label = document.querySelector('label[for="' + el.id + '"]');
                if (label) name = label.textContent.trim();
            } else if (['BUTTON', 'A', 'SUMMARY'].includes(el.tagName)) {
                name = el.textContent.trim().replace(/\s+/g, ' ');
            } else if (el.hasAttribute('title')) {
                name = el.getAttribute('title').trim();
            }
            
            return name;
        }

        function getRole(el) {
            if (el.hasAttribute('role')) {
                return el.getAttribute('role').trim().toLowerCase();
            }
            
            var implicitRoles = {
                'A': 'link',
                'BUTTON': 'button',
                'SELECT': 'combobox',
                'TEXTAREA': 'textbox',
                'IMG': 'img',
                'SUMMARY': 'button'
            };
            
            if (el.tagName === 'INPUT') {
                var typeRoles = {
                    'button': 'button', 'submit': 'button', 'reset': 'button', 'image': 'button',
                    'checkbox': 'checkbox', 'radio': 'radio', 'range': 'slider', 'number': 'spinbutton',
                    'email': 'textbox', 'password': 'textbox', 'search': 'searchbox', 'tel': 'textbox',
                    'text': 'textbox', 'url': 'textbox'
                };
                return typeRoles[el.type] || 'textbox';
            }
            
            return implicitRoles[el.tagName] || '';
        }

        function requiresName(el, role) {
            var alwaysNeedName = [
                'button', 'link', 'tab', 'menuitem', 'option', 'checkbox', 'radio',
                'switch', 'slider', 'spinbutton', 'textbox', 'searchbox', 'combobox'
            ];
            
            if (alwaysNeedName.includes(role)) return true;
            if (['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return true;
            if (el.hasAttribute('onclick')) return true;
            
            return false;
        }

        function getValue(el, role) {
            if (['checkbox', 'radio'].includes(el.type)) {
                return el.checked ? 'checked' : 'unchecked';
            }
            
            if (el.tagName === 'SELECT') {
                var selected = el.selectedOptions[0];
                return selected ? selected.textContent.trim() : '(no selection)';
            }
            
            if (['INPUT', 'TEXTAREA'].includes(el.tagName)) {
                return el.value || '(empty)';
            }
            
            if (el.hasAttribute('aria-checked')) {
                return el.getAttribute('aria-checked');
            }
            
            if (el.hasAttribute('aria-pressed')) {
                return el.getAttribute('aria-pressed');
            }
            
            if (el.hasAttribute('aria-selected')) {
                return el.getAttribute('aria-selected');
            }
            
            return 'N/A';
        }

        // Process each element
        allElements.forEach(function(el, index) {
            var name = getAccessibleName(el);
            var role = getRole(el);
            var needsName = requiresName(el, role);
            var value = getValue(el, role);
            var issues = [];
            var hasName = name && name.length > 0;
            var hasRole = role && role.length > 0;

            if (needsName && !hasName) {
                issues.push('Missing accessible name');
            }
            
            if (!hasRole && el.tagName === 'DIV' && (el.hasAttribute('onclick') || el.hasAttribute('tabindex'))) {
                issues.push('Interactive div needs explicit role');
            }

            var result = {
                element: el,
                index: index,
                tagName: el.tagName,
                name: name || '[Missing]',
                role: role || '[Missing]',
                value: value || '[Missing]',
                issues: issues,
                hasName: hasName,
                hasRole: hasRole
            };

            if (issues.length > 0) {
                results.failed.push(result);
            } else {
                results.passed.push(result);
            }
        });

        // Initialize UI with results
        initUI(ui, results);
    }

    // UI Management
    function initUI(ui, results) {
        var currentTab = 'failed';
        var currentIndex = 0;

        function updateContent() {
            var items = results[currentTab];
            
            if (!items.length) {
                ui.body.innerHTML = '<div class="nrv-counter">No ' + currentTab + ' elements</div>';
                return;
            }

            var html = '<div class="nrv-counter">' + items.length + ' ' + currentTab + ' elements</div>';
            
            items.forEach(function(item, i) {
                var prevBtn = '<button class="nrv-btn nrv-btn-nav" onclick="window.nrvNavigate(\'prev\')">‹</button>';
                var nextBtn = '<button class="nrv-btn nrv-btn-nav" onclick="window.nrvNavigate(\'next\')">›</button>';
                
                html += '<div class="nrv-item ' + (i === currentIndex ? 'current' : '') + '">' +
                    '<div class="nrv-element-tag">&lt;' + item.tagName.toLowerCase() + '&gt;' + 
                    (item.element.id ? ' #' + item.element.id : '') + '</div>' +
                    (item.issues.length ? 
                        '<div class="nrv-fail-reason">' + item.issues.join(', ') + '</div>' : 
                        '<div class="nrv-pass-note">✓ Passes all checks</div>') +
                    '<div class="nrv-element-details">' +
                    '<strong>Name:</strong> ' + item.name + '<br>' +
                    '<strong>Role:</strong> ' + item.role + '<br>' +
                    '<strong>Value:</strong> ' + item.value +
                    '</div>' +
                    '<div class="nrv-actions">' +
                    '<button class="nrv-btn nrv-btn-highlight" onclick="window.nrvHighlight(' + i + ')">Highlight</button>' +
                    prevBtn + nextBtn +
                    '</div>' +
                    '</div>';
            });
            
            ui.body.innerHTML = html;
        }

        function createTabs() {
            var failedBtn = '<button class="nrv-tab ' + (currentTab === 'failed' ? 'active' : '') + 
                           '" onclick="window.nrvSwitchTab(\'failed\')">Failed (' + results.failed.length + ')</button>';
            var passedBtn = '<button class="nrv-tab ' + (currentTab === 'passed' ? 'active' : '') + 
                           '" onclick="window.nrvSwitchTab(\'passed\')">Passed (' + results.passed.length + ')</button>';
            
            ui.tabs.innerHTML = failedBtn + passedBtn;
        }

        // Global functions for UI interactions
        window.nrvSwitchTab = function(tab) {
            currentTab = tab;
            currentIndex = 0;
            document.querySelectorAll('.nrv-tab').forEach(function(t) {
                t.classList.remove('active');
            });
            document.querySelector('.nrv-tab:nth-child(' + (tab === 'failed' ? 1 : 2) + ')').classList.add('active');
            updateContent();
        };

        window.nrvHighlight = function(index) {
            document.querySelectorAll('.nrv-highlight').forEach(function(el) {
                el.classList.remove('nrv-highlight');
            });
            
            var res = results[currentTab][index];
            if (res) {
                res.element.classList.add('nrv-highlight');
                res.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            currentIndex = index;
            updateContent();
        };

        window.nrvNavigate = function(dir) {
            var arr = results[currentTab];
            if (!arr.length) return;
            
            currentIndex = (dir === 'next') ? 
                (currentIndex + 1) % arr.length : 
                (currentIndex - 1 + arr.length) % arr.length;
            
            window.nrvHighlight(currentIndex);
        };

        // Dragging functionality
        var isDragging = false, offsetX = 0, offsetY = 0;
        
        ui.root.addEventListener('mousedown', function(e) {
            if (e.target !== ui.root.querySelector('.nrv-close') && 
                !e.target.closest('.nrv-tabs') && 
                !e.target.closest('.nrv-actions')) {
                isDragging = true;
                offsetX = e.clientX - ui.root.offsetLeft;
                offsetY = e.clientY - ui.root.offsetTop;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                ui.root.style.left = (e.clientX - offsetX) + 'px';
                ui.root.style.top = (e.clientY - offsetY) + 'px';
                ui.root.style.transform = 'none';
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.querySelectorAll('.nrv-panel, .nrv-style, .nrv-highlight').forEach(function(el) {
                    el.remove();
                });
            }
        });

        // Final setup
        ui.status.innerHTML = '<strong>Analysis Complete:</strong> ' + 
            (results.failed.length + results.passed.length) + ' interactive elements found';
        
        createTabs();
        updateContent();
        
        console.log('🏷️ WCAG Name, Role, Value Analysis Complete!');
    }
})();