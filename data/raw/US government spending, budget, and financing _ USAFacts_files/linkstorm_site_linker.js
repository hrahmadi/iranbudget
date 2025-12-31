/**
 * COPYRIGHT 2025 LINKSTORM.IO
 * ALL RIGHTS RESERVED
 * 
 * THIS SOFTWARE IS PROVIDED "AS IS" AND WITHOUT ANY WARRANTIES.
 * 
 * THIS SOURCE CODE CAN NOT BE USED, MODIFIED, OR REDISTRIBUTED WITHOUT
 * THE EXPRESSED WRITTEN CONSENT OF LINKSTORM.IO
 * 
 * 
 * AUTHOR: Shyam Verma (https://shyamverma.com) 
 * Version: 2025-05-07
 */

"use strict";
(window => {

    // --- Initial Setup & Variable Declarations ---
    const { location, document } = window;
    if (!document.currentScript) {
        console.error("LinkstormLinker: Cannot initialize, document.currentScript is null.");
        return;
    }
    const { currentScript } = document;
    const { hostname, href } = location;

    const tempElementToEncodeHtml = document.createElement('textarea');
    const tempElementToDecodeHtml = document.createElement('div');
    const urlParams = new URLSearchParams(window.location.search.replace(/&amp;/g, '&'));
    const verifyInstallation = urlParams.has('linkstormVerifyInstallation');

    // --- Helper Function Definitions ---
    function encodeHtml(text) {
        if (!text) return "";
        tempElementToEncodeHtml.textContent = text;
        return tempElementToEncodeHtml.innerHTML;
    }

    function decodeHtml(html) {
        if (!html) return "";
        // Replace non-breaking spaces before decoding other entities
        const nbspSafeHtml = String(html).replace(/&nbsp;/g, ' ');
        tempElementToDecodeHtml.innerHTML = nbspSafeHtml;
        return tempElementToDecodeHtml.textContent || '';
    }

    function parseScriptQueryParams(src) {
        const paramsStr = (src || "").split('?')[1] || null;
        if (!paramsStr) return {};
        const params = paramsStr.split('&');
        const paramsObj = {};
        params.forEach(param => {
            const [key, value] = param.split('=');
            if (key) paramsObj[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        return paramsObj;
    }

    const encodeUrl = str => {
        if (!str) return undefined;
        try {
            // Avoid double encoding
            const decoded = decodeURI(String(str));
            if (decoded !== str) {
                // It was already encoded (or partially encoded)
                return str; // Return as is, assuming it's correctly encoded upstream
            }
        } catch (e) {
            // If decodeURI fails, it's likely not a valid URI or already encoded weirdly
            // Proceed to encode cautiously
            console.warn("decodeURI failed for", str, e);
        }
        // Encode the string if it wasn't already encoded
        return encodeURI(String(str));
    };

    const parseURL = url => {
        if (!url) return '';
        try {
            const parsed = new URL(url);
            return parsed.origin + parsed.pathname; // Return origin + path, strip query/hash
        } catch (e) {
            // If URL parsing fails, try simple string split as fallback
            debugLog('parseURL: Invalid URL, using simple split:', url, e);
            return String(url).split('?')[0];
        }
    };

    const getHostWithScheme = url => {
        if (!url) return '';
        try {
            return new URL(url).origin;
        } catch (e) {
            errorLog('getHostWithScheme: Invalid URL:', url, e);
            return '';
        }
    };

    const cleanText = (text) => {
        // Decode, handle nbsp, remove non-alphanumeric (keep space), collapse space, lower, trim
        return decodeHtml(text || "")
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove non-alphanumeric/non-space
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .trim();
    };



    // --- Configuration & Global State ---

    const scriptQueryParams = parseScriptQueryParams(currentScript.src);
    const getQueryParam = (name) => urlParams.get('debugLS_' + name) || scriptQueryParams[name] || currentScript.dataset[name];

    let debug = getQueryParam('debug') === 'true' || urlParams.has('debug') || false;
    const debugLog = (...args) => debug && console.log(`LS: ${Date.now()}`, ...args);
    const errorLog = (...args) => console.error(`LS: Error ${Date.now()} `, ...args); // Always log errors
    const setDebug = (value) => { debug = value; debugLog('Debug mode is now:', debug); }

    const projectId = getQueryParam('projectId');
    const websiteId = getQueryParam('websiteId');
    const ServerHost = getQueryParam('serverDomain') || getHostWithScheme(currentScript.src);
    const pageUrl = getQueryParam('pageUrl') || parseURL(href); // Use parseURL for consistency
    const apiHost = ServerHost.includes('staging.linkstorm.io') ? 'https://api.linkstorm.io/staging'
        : ServerHost.includes('linkstorm.io') ? 'https://api.linkstorm.io/prod'
            : ServerHost.includes('localhost') ? 'http://127.0.0.1:8888'
                : ServerHost;
    const endpoint = `${apiHost}/get_website_page_opportunities?projectId=${projectId}&websiteId=${websiteId}&pageUrl=${encodeUrl(pageUrl)}`;
    const statusEndpoint = `${ServerHost}/linker/projects/${projectId}/websites/${websiteId}/set_website_page_opportunities_status`;
    const useSampleOpportunities = getQueryParam('useSampleOpportunities') || null; // Use sample data if true, otherwise fetch from API
    const delayLoadingMs = parseInt(getQueryParam('delayLoadingMs') || 10); // Delay loading by specified milliseconds
    const domSettlementTimeoutMs = parseInt(getQueryParam('domSettlementTimeoutMs') || 50); // Timeout for DOM settlement in milliseconds
    const sampleOpportunities = [
        {
            "target": "https://blog.linkody.com/seo/targeted-keywords",
            "accepted": "accepted",
            "anchor": "delicate necklace",
            "matchedSentence": "Gold delicate necklace",
            "status": false,
            "type": "SemanticOpportunityCompleted",
            "id": "67dd5e5873b7b414530cb264"
        },
    ];

    debugLog(`LinkstormLinker initialized with params:`, {
        projectId,
        websiteId,
        ServerHost,
        pageUrl,
        apiHost,
        endpoint,
        useSampleOpportunities,
        delayLoadingMs,
        domSettlementTimeoutMs,
    });

    let initialized = false; // Initialization flag
    const excludeTags = ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'style', 'button', 'textarea', 'select', 'pre', 'code', 'noscript', 'label', 'option', 'nav', 'figure', 'figcaption', 'svg', 'img', 'video', 'audio', 'iframe', 'object', 'embed', 'canvas', 'map', 'area', 'datalist', 'output', 'progress', 'meter'];

    // --- Core Linking Logic Definitions ---

    /**
     * Injects a link using the Range API, designed to handle anchor text
     * that may be fragmented across multiple text nodes and inline elements.
     * PREVENTS injection if the target element is or is inside H1-H6 tags.
     * Preserves event listeners on nodes within the range.
     *
     * @param {Node} node - The container node (usually an Element) to search within.
     * @param {string} sentenceText - The context sentence.
     * @param {string} anchorText - The anchor text to find and wrap.
     * @param {string} linkUrl - The URL for the link.
     * @param {string} linkId - The ID for the link's data attribute.
     * @param {boolean} [sentenceMatched=false] - Whether the sentence context was matched higher up.
     * @returns {boolean} - True if the link was successfully injected, false otherwise.
     */
    function injectLinkInNodeUsingRangeApi(node, sentenceText, anchorText, linkUrl, linkId, sentenceMatched = false) {
        // --- PREVENT LINKING INSIDE H1-H6 ---
        // Check if the target node itself is a header tag or if it's inside one.
        const headerTags = 'h1, h2, h3, h4, h5, h6';
        if (node.nodeType === Node.ELEMENT_NODE && node.matches(headerTags)) {
            debugLog("injectLinkInNodeUsingRangeApi: Skipping - Target node is a header tag:", node.tagName);
            return false;
        }
        // Use parentElement to check ancestors
        if (node.parentElement && node.parentElement.closest(headerTags)) {
            debugLog("injectLinkInNodeUsingRangeApi: Skipping - Target node is inside a header tag:", node);
            return false;
        }
        // --- END H1-H6 CHECK ---

        // Ensure we are working with an element node as the primary container
        if (node.nodeType !== Node.ELEMENT_NODE) {
            debugLog("injectLinkInNodeUsingRangeApi: Input node is not an element.", node);
            return false; // Already handled header check, but good practice
        }

        const element = node; // Use 'element' for clarity
        debugLog("injectLinkInNodeUsingRangeApi: Attempting Range API injection in:", element, "Anchor:", anchorText);

        const decodedAnchorLower = decodeHtml(anchorText).toLowerCase();
        let textMap = []; // Stores { node: Node, text: string, start: number, end: number }
        let currentOffset = 0;
        let anchorFound = false;
        let startIndex = -1;
        let endIndex = -1;
        const excludeTagsDuringTraversal = ['script', 'style', 'a', 'button', 'textarea', 'select', 'pre', 'code', 'noscript', 'figure', 'figcaption', 'nav']; // Removed h1-h6 here as the main check covers it
        const inlineTags = ['strong', 'em', 'span', 'b', 'i', 'u', 'sub', 'sup', 'font', 'abbr', 'acronym', 'cite', 'dfn', 'kbd', 'samp', 'var', 'q', 'small', 'big', 'tt', 'mark', 'del', 'ins'];

        function traverse(currentNode) {
            if (anchorFound) return;
            const nodeNameLower = currentNode.nodeName.toLowerCase();
            if (currentNode.parentNode && currentNode.parentNode.closest('a, [data-linkstorm-generated-link]')) { return; }
            // No need to check excludeTagsDuringTraversal for h1-h6 here, as the initial function check prevents entry.
            if (currentNode.nodeType === Node.ELEMENT_NODE && excludeTagsDuringTraversal.includes(nodeNameLower)) { return; }

            if (currentNode.nodeType === Node.TEXT_NODE) {
                const text = currentNode.textContent;
                if (text.length > 0) {
                    const start = currentOffset;
                    const end = start + text.length;
                    textMap.push({ node: currentNode, text: text, start: start, end: end });
                    currentOffset = end;
                    let cumulativeTextLower = textMap.map(tm => tm.text).join("").toLowerCase();
                    startIndex = cumulativeTextLower.indexOf(decodedAnchorLower);
                    if (startIndex !== -1) {
                        endIndex = startIndex + decodedAnchorLower.length;
                        if (endIndex <= currentOffset) {
                            anchorFound = true;
                            return;
                        }
                    } else {
                        endIndex = -1;
                    }
                }
            } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
                const canTraverseChildren = inlineTags.includes(nodeNameLower) || currentNode === element;
                if (canTraverseChildren) {
                    for (let i = 0; i < currentNode.childNodes.length; i++) {
                        traverse(currentNode.childNodes[i]);
                        if (anchorFound) return;
                    }
                }
            }
        }

        traverse(element);

        if (!anchorFound) {
            debugLog("injectLinkInNodeUsingRangeApi: Anchor sequence not fully mapped within element:", element);
            return false;
        }
        if (startIndex === -1 || endIndex === -1) {
            errorLog("injectLinkInNodeUsingRangeApi: Internal state error - anchorFound=true but indices invalid.", { startIndex, endIndex });
            return false;
        }

        let firstNodeInfo = null;
        let lastNodeInfo = null;
        for (const info of textMap) {
            if (!firstNodeInfo && startIndex >= info.start && startIndex < info.end) { firstNodeInfo = info; }
            if (endIndex > info.start && endIndex <= info.end) { lastNodeInfo = info; }
            if (firstNodeInfo && lastNodeInfo) break;
        }

        if (!firstNodeInfo || !lastNodeInfo) {
            errorLog("injectLinkInNodeUsingRangeApi: Could not map calculated anchor indices back to text nodes.", { element, textMap });
            return false;
        }

        try {
            const range = document.createRange();
            const firstNode = firstNodeInfo.node;
            const lastNode = lastNodeInfo.node;
            const firstNodeOffset = startIndex - firstNodeInfo.start;
            const lastNodeOffset = endIndex - lastNodeInfo.start;

            if (firstNodeOffset < 0 || firstNodeOffset > firstNode.length || lastNodeOffset < 0 || lastNodeOffset > lastNode.length) {
                errorLog("injectLinkInNodeUsingRangeApi: Calculated invalid range offsets within text nodes.", { firstNodeOffset, fl: firstNode.length, lastNodeOffset, ll: lastNode.length });
                return false;
            }

            range.setStart(firstNode, firstNodeOffset);
            range.setEnd(lastNode, lastNodeOffset);

            if (!element.contains(range.commonAncestorContainer)) {
                errorLog("injectLinkInNodeUsingRangeApi: Range common ancestor is outside the target element.", { rangeAncestor: range.commonAncestorContainer, element });
                return false;
            }
            // No need to re-check for h1-h6 inside range contents, as the initial check prevents entry.
            const rangeContentsCheck = range.cloneContents();
            if (rangeContentsCheck.querySelector(excludeTagsDuringTraversal.join(','))) { // Check other excluded tags
                errorLog("injectLinkInNodeUsingRangeApi: Range unexpectedly contains forbidden elements.", range);
                return false;
            }
            if (range.startContainer.parentNode.closest('a, [data-linkstorm-generated-link]') || range.endContainer.parentNode.closest('a, [data-linkstorm-generated-link]')) {
                errorLog("injectLinkInNodeUsingRangeApi: Range boundary is inside an existing link.", range);
                return false;
            }

            const link = document.createElement('a');
            link.href = linkUrl;
            link.dataset.linkstormGeneratedLink = linkId;

            const fragment = range.extractContents();
            link.appendChild(fragment);
            range.insertNode(link);

            debugLog("injectLinkInNodeUsingRangeApi: Successfully created link using Range API:", link);
            return true;

        } catch (e) {
            errorLog("injectLinkInNodeUsingRangeApi: DOM Range/manipulation error:", e, { element, anchorText, startIndex, endIndex, firstNodeInfo, lastNodeInfo });
            return false;
        }
    }






    // while injecting link in a node, we need to make sure the node have matchedSentence as text content irrespective of the tags
    // inject link in a node, will only search for anchorText in the text content of the node
    function injectUsingTextNodeEditing(node, sentenceText, anchorText, linkUrl, linkId, sentenceMatched = false) {
        //if node is <a> tag we skip it
        if (node.nodeType === Node.ELEMENT_NODE && excludeTags.includes(node.tagName.toLowerCase())) {
            return false;
        }

        sentenceMatched = sentenceMatched || cleanText(node.textContent).includes(cleanText(sentenceText));
        const sentenceIndex = node.textContent.toLowerCase().indexOf(decodeHtml(sentenceText).toLowerCase());
        // IMP: anchorINdex must be accurate, must be actual text, do not clean
        let anchorIndex = node.textContent.toLowerCase().indexOf(decodeHtml(anchorText).toLowerCase());
        if (node.nodeType === Node.TEXT_NODE && anchorIndex !== -1 && (sentenceMatched || sentenceIndex !== -1)) {

            //IF anchor is multiple times in the node, we need to link the correct one
            if (sentenceIndex !== -1) {
                const startIndex = sentenceIndex;
                // find thecorrect index to be used for anchorText in the node, by using the sentenceIndex
                anchorIndex = node.textContent.toLowerCase().indexOf(decodeHtml(anchorText).toLowerCase(), startIndex);
            }

            const beforeText = node.textContent.substring(0, anchorIndex);
            const afterText = node.textContent.substring(anchorIndex + anchorText.length);

            const link = document.createElement('a');
            link.href = linkUrl;
            link.textContent = anchorText;
            // data-linkstorm-generated-link="${opportunity.id}"
            link.dataset.linkstormGeneratedLink = linkId;


            const newNodes = [];
            if (beforeText) {
                newNodes.push(document.createTextNode(beforeText));
            }
            newNodes.push(link);
            if (afterText) {
                newNodes.push(document.createTextNode(afterText));
            }

            node.replaceWith(...newNodes);
            return true;

        } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 0) {
            for (let i = 0; i < node.childNodes.length; i++) {
                if (injectUsingTextNodeEditing(node.childNodes[i], sentenceText, anchorText, linkUrl, linkId, sentenceMatched)) {
                    return true;
                }
            }
        }
        return false;
    }



    /**
 * Dispatches link injection to the appropriate method based on node type
 * and whether the anchor is contained within a single text node or spans multiple nodes.
 * @param {Node} node - The current node to process.
 * @param {string} sentenceText - The context sentence.
 * @param {string} anchorText - The anchor text to link.
 * @param {string} linkUrl - The target URL.
 * @param {string} linkId - The opportunity ID.
 * @param {boolean} [sentenceMatched=false] - Whether the sentence context has been met in an ancestor.
 * @returns {boolean} - True if a link was injected in this node or its descendants.
 */
    function injectLinkInNode(node, sentenceText, anchorText, linkUrl, linkId, sentenceMatched = false) {
        // get the node that contains the sentenceText but none of the children have it
        node = getNodeThatContainsTextButNotTheChildren(node, sentenceText);
        if (!node) {
            return false;
        }

        sentenceMatched = true;
        // try to inject in the node using TextNodeEditing
        let linkInjected = injectUsingTextNodeEditing(node, sentenceText, anchorText, linkUrl, linkId, sentenceMatched);

        if (linkInjected) {
            return true;
        }

        // try to inject in the node using Range API
        return injectLinkInNodeUsingRangeApi(node, sentenceText, anchorText, linkUrl, linkId, sentenceMatched);
    }


    // --- Test Harness Compatibility Function Definition ---
    /**
     * Compatibility function for testing. Attempts to find and inject a link
     * strictly within the provided containerElement.
     * @param {object} opportunity - The opportunity { id, anchor, matchedSentence, target, ... }
     * @param {Element} containerElement - The specific DOM element to search within.
     * @param {string} _searchAnchor - (Ignored)
     * @param {string} _searchSentence - (Ignored)
     * @returns {Promise<boolean>} - True if the link was successfully injected, false otherwise.
     */
    const linkOpportunityInElement = async (opportunity, containerElement) => {
        debugLog(`linkOpportunityInElement called for opp ${opportunity?.id} in element:`, containerElement);
        if (!opportunity || !containerElement || !opportunity.id || !opportunity.anchor) {
            errorLog('linkOpportunityInElement: Missing opportunity or containerElement or opportunity.id or opportunity.anchor');
            return false;
        }

        const success = injectLinkInNode(containerElement, opportunity.matchedSentence, opportunity.anchor, opportunity.target, opportunity.id);
        if (success) {
            debugLog(`linkSingleOpportunity: Successfully linked opportunity.`, opportunity);
            return true;
        } else {
            errorLog(`linkSingleOpportunity: Injection failed for opportunity.`, opportunity);
            return false;
        }
    };


    /**
        * Finds elements matching a global XPath within the document body,
        * then filters them based on targetContainer and whether they
        * directly contain a specific searchSentence (if provided),
        * or any direct non-empty text if searchSentence is null/undefined.
        * Excludes <script> and <style> tags.
        *
        * @param {string} xp - The XPath expression to evaluate globally.
        * @param {string|null|undefined} searchSentence - The specific text to find within direct text nodes.
        * If null/undefined, checks for *any* direct text. Case-sensitive.
        * @param {Node} [targetContainer=document.body] - The DOM node to scope results to.
        * @returns {Element[]} An array of DOM elements matching all criteria.
        */
    const getTextContainingElementsByXpath = (xp, searchSentence, targetContainer = document.body) => {
        //IMP: xp is case SENSITIVE
        searchSentence = decodeHtml(searchSentence);
        // Ensure targetContainer is a valid node
        if (!targetContainer || typeof targetContainer.contains !== 'function') {
            console.warn("Invalid targetContainer provided, defaulting to document.body.");
            targetContainer = document.body;
        }

        let snapshot;
        try {
            // Step 1: Evaluate the XPath against the target container using a snapshot
            snapshot = document.evaluate(
                xp,
                targetContainer,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, // Use snapshot to avoid mutation errors
                null
            );
        } catch (error) {
            console.error(`XPath evaluation error for "${xp}":`, error);
            return [];
        }

        const initialNodes = [];
        try {
            // Step 2: Collect all valid element nodes from the snapshot
            for (let i = 0; i < snapshot.snapshotLength; i++) {
                const node = snapshot.snapshotItem(i);

                // Basic filtering during initial collection
                if (node.nodeType !== Node.ELEMENT_NODE) continue; // Only elements

                // Ensure node is still within the intended container (paranoia check)
                if (!targetContainer.contains(node)) continue;

                // Exclude globally forbidden tags
                const tagName = node.tagName.toLowerCase();
                if (excludeTags.includes(tagName)) continue;

                // we must ensure that the node is not a descendant of an excluded tag and excludedTag node must be child of targetContainer
                const excludedTagNode = node.closest(excludeTags.join(','));
                if (excludedTagNode && targetContainer.contains(excludedTagNode)) {
                    debugLog(`Node ${node.tagName} is a descendant of an excluded tag (${excludedTagNode.tagName}), skipping.`);
                    continue; // Skip nodes that are descendants of excluded tags
                }

                //IMP: Keep only nodes containing the cleaned sentence text, we searched in XP for searchAnchor only
                if (!cleanText(node.textContent).includes(cleanText(searchSentence))) continue;

                initialNodes.push(node);
            }
        } catch (error) {
            console.error(`Error processing XPath snapshot for "${xp}":`, error);
            return [];
        }

        // Step 3: Further filtering steps
        let filteredNodes = initialNodes
            // Keep only the most specific(deepest) nodes.
            // If node A contains node B, and both are in the list, remove node A.
            .filter(nodeA => {
                // Check if any *other* node B in the list is a descendant of nodeA
                return !initialNodes.some(nodeB => nodeA !== nodeB && nodeA.contains(nodeB));
            })
            .map(node => getNodeThatContainsTextButNotTheChildren(node, searchSentence))
            .filter(node => node !== null)
            // 3b. Remove duplicates (reference equality is sufficient here)
            .filter((node, index, self) => self.indexOf(node) === index);


        return filteredNodes;
    };


    const getNodeThatContainsTextButNotTheChildren = (node, text) => {
        // node HTML should contain text, but none of the child nodes should contain the same text
        // make it case insensitive
        if (!cleanText(node.textContent).includes(cleanText(text))) {
            return null;
        }

        //if any child node satisifed, return that node 
        if (node.hasChildNodes()) {
            for (const child of node.childNodes) {
                if (getNodeThatContainsTextButNotTheChildren(child, text)) {
                    return node;
                }
            }
        }

        // the node itself contains the text but not the children
        return node;
    }

    // --- API Interaction Definitions ---

    const sendStatusUpdate = async (payload) => {
        if (!payload || payload.length === 0) {
            debugLog('sendStatusUpdate: No status payload to send.');
            return;
        }
        if (!statusEndpoint) {
            errorLog('sendStatusUpdate: Status endpoint is not configured.');
            return;
        }

        debugLog('sendStatusUpdate: Sending status update for', payload.length, 'items:', payload);
        try {
            const response = await fetch(statusEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            debugLog('sendStatusUpdate: Response status:', response.status);
            if (!response.ok) {
                errorLog('sendStatusUpdate: Failed. Status:', response.status, response.statusText);
                try { // Try to get error details from body
                    const body = await response.json();
                    errorLog('sendStatusUpdate: Error body:', body);
                } catch (e) { /* Ignore if body isn't JSON */ }
                return null;
            }
            const result = await response.json();
            debugLog('sendStatusUpdate: Success. Result:', result);
            return result;
        } catch (e) {
            errorLog('sendStatusUpdate: Network error or exception.', e);
            return null;
        }
    };

    const fetchLinks = async () => {
        if (!projectId || !websiteId || isNaN(parseInt(projectId)) || isNaN(parseInt(websiteId))) {
            errorLog('fetchLinks: Invalid projectId or websiteId.', { projectId, websiteId });
            return null;
        }
        if (!endpoint) {
            errorLog('fetchLinks: API endpoint is not configured.');
            return null;
        }

        debugLog('fetchLinks: Fetching opportunities from:', endpoint);
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json', // Usually not needed for GET, but ok
                    'Accept': 'application/json',
                },
            });
            debugLog('fetchLinks: Response status:', response.status);

            if (!response.ok) {
                errorLog('fetchLinks: Failed. Status:', response.status, response.statusText);
                let errorMsg = `HTTP error ${response.status}`;
                try { // Try to get error details from body
                    const body = await response.json();
                    errorLog('fetchLinks: Error body:', body);
                    if (body.errorMessage) errorMsg = body.errorMessage;
                } catch (e) { /* Ignore if body isn't JSON */ }
                errorLog('Linkstorm: Not able to fetch Links.', errorMsg);
                return null;
            }

            const opportunities = await response.json();
            debugLog('fetchLinks: Received', opportunities?.length || 0, 'opportunities.');
            return opportunities;
        } catch (e) {
            errorLog('fetchLinks: Network error or exception.', e);
            return null;
        }
    };


    const findPotentialNodesForOpportunity = (opportunity, searchRoot) => {
        const searchAnchor = decodeHtml(opportunity.anchor);
        const searchSentence = decodeHtml(opportunity.matchedSentence);
        const xpath = `//*[contains(., '${searchAnchor}')]`;
        const candidateElements = getTextContainingElementsByXpath(xpath, searchSentence, searchRoot || document.body);
        return candidateElements;
    }

    // --- Main Orchestration Definition ---
    const linkOpportunity = async (opportunity, searchRoot = document.body) => {
        let found = false;
        // Define the types of elements to search within. Order might matter depending on common page structures.
        const elementsToSearch = ['*'];
        const searchAnchor = opportunity.anchor; // Keep for debug logs, though not directly used in XPath
        const searchSentence = opportunity.matchedSentence;

        if (!searchSentence || !searchAnchor) {
            errorLog('linkOpportunity: Missing anchor or sentence in opportunity:', opportunity);
            return false; // Cannot proceed without essential data
        }

        debugLog(`linkOpportunity: Starting for opp ${opportunity.id}: "${searchAnchor}" with sentence context.`);

        for (const elementType of elementsToSearch) {

            const candidateElements = findPotentialNodesForOpportunity(opportunity, searchRoot || document.body);

            if (!candidateElements || candidateElements.length === 0) {
                debugLog(`linkOpportunity: No <${elementType}> elements found containing the sentence via XPath.`);
                continue; // Try the next element type
            }

            debugLog(`linkOpportunity: Found ${candidateElements.length} potential <${elementType}> elements containing the sentence.`);

            // Now, attempt to inject the link within each *specific* candidate element found.
            // linkOpportunityInElement will perform the finer-grained search for the exact text node inside.
            for (const element of candidateElements) {
                // Pass the specific element found by XPath as the container to search within.
                // linkOpportunityInElement internally calls linkSingleOpportunity with this element as searchRoot.
                found = await linkOpportunityInElement(opportunity, element);
                if (found) {
                    debugLog(`linkOpportunity: Successfully linked in element:`, element);
                    return true; // Link injected, exit the entire function
                } else {
                    debugLog(`linkOpportunity: Failed to link in specific element (continuing search):`, element);
                }
            }
            // If loop finishes without finding, 'found' remains false, and we continue to the next elementType.
        } // End loop through element types

        debugLog(`linkOpportunity: Exhausted all element types. Could not link opportunity ${opportunity.id}: "${searchAnchor}"`);
        return false; // Link not injected after checking all types
    }


    const link = async () => {

        let opportunities = [];
        if (useSampleOpportunities) {
            // Use sample data instead of fetching from API
            debugLog('link: Using sample opportunities data instead of fetching from API.');
            opportunities = sampleOpportunities;
            debugLog(`link: Fetched ${opportunities.length} opportunities from sample data.`);
        } else {
            opportunities = await fetchLinks();
        }

        if (!opportunities || opportunities.length === 0) {
            debugLog('link: No opportunities found or fetch failed.');
            return;
        }

        debugLog('link: Starting linking process for', opportunities.length, 'opportunities.');
        let totalLinked = 0;
        const statusEndpointPayload = [];
        // Keep track of opportunity IDs we've *attempted* to process in this run
        const processedOpportunityIds = new Set();

        for (const opportunity of opportunities) {
            // Basic validation of the opportunity object from the API
            if (!opportunity || !opportunity.id || !opportunity.anchor) {
                debugLog("link: Skipping invalid opportunity object received from API:", opportunity);
                continue;
            }

            // Check if we've already processed this *specific opportunity ID* in this run
            // Prevents issues if the API accidentally returns duplicate opportunity IDs.
            if (processedOpportunityIds.has(opportunity.id)) {
                debugLog(`link: Opportunity ID ${opportunity.id} (${opportunity.anchor}) was already processed in this run, skipping duplicate.`);
                continue;
            }

            // Mark this ID as processed for this run, regardless of success/failure
            processedOpportunityIds.add(opportunity.id);

            // *** CHANGE HERE: Call the refactored linkOpportunity ***
            // This function now orchestrates finding the element and calling linkOpportunityInElement
            const wasLinked = await linkOpportunity(opportunity); // Use await as it's now async

            // Determine if status needs update and update counts/payload
            if (wasLinked) {
                totalLinked++;
                // Status changed if it wasn't already true
                if (opportunity.status !== true) {
                    debugLog(`link: Status changed to true for opportunity ${opportunity.id}.`);
                    statusEndpointPayload.push({ id: opportunity.id, type: opportunity.type, status: true });
                } else {
                    debugLog(`link: Opportunity ${opportunity.id} successfully linked, status was already true.`);
                }
            } else {
                // Link attempt failed or no suitable location found
                // Status changed if it wasn't already false
                if (opportunity.status !== false) {
                    debugLog(`link: Status changed to false for opportunity ${opportunity.id}.`);
                    statusEndpointPayload.push({ id: opportunity.id, type: opportunity.type, status: false });
                } else {
                    debugLog(`link: Opportunity ${opportunity.id} could not be linked, status was already false.`);
                }
            }
        } // End loop through opportunities

        debugLog('link: Linking process finished. Opportunities processed:', processedOpportunityIds.size, 'Total Successfully Linked:', totalLinked);
        await sendStatusUpdate(statusEndpointPayload);

        debugLog('Waiting 10 seconds to verify links on the page...');
        setTimeout(() => {
            debugLog('link: Verifying links on the page after 10 seconds of linking process...');
            // verify if links still existing
            const generatedLinks = document.querySelectorAll('[data-linkstorm-generated-link]');
            const parentElements = Array.from(generatedLinks).map(link => link.parentElement);
            debugLog(`Found ${generatedLinks.length} generated links on the page. Their parent elements are:`, parentElements);
            if (totalLinked !== generatedLinks.length) {
                errorLog(`link: Mismatch! Linkstrom injected ${totalLinked} opportunities, but after 10 seconds found ${generatedLinks.length} links on the page.`);
            } else {
                debugLog(`link: All ${totalLinked} linked opportunities are present on the page.`);
            }
        }, 10000)
    };

    // --- Installation Verification Definition ---
    const defaultPopupStyle = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: '9999',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const verifyInstallationAndPopup = async () => {
        // ... uses urlParams, debugLog, errorLog, ServerHost ...
        debugLog('verifyInstallationAndPopup: Starting verification...');
        // ... rest of implementation ...
        let verified = true;

        // show a popup with a list of message, using vannilla js
        const popup = document.createElement('div');
        Object.assign(popup.style, defaultPopupStyle);


        let checks = [];
        checks.push({
            name: 'Link injection script found',
            status: 'success',
        });

        // check if projectId and websiteId is set
        debugLog('projectId', projectId);
        let projectIdCheck = false;
        const expectedProjectId = urlParams.get('linkstormProjectId');
        if (!projectId) {
            checks.push({ name: 'ProjectId is not set in script tag', status: 'error' });
        } else if (isNaN(parseInt(projectId))) {
            checks.push({ name: 'ProjectId in script tag is not a number', status: 'error' });
        } else if (!expectedProjectId || parseInt(projectId) !== parseInt(expectedProjectId)) {
            checks.push({ name: `ProjectId in script tag (${projectId}) does not match expected (${expectedProjectId || 'N/A'})`, status: 'error' });
        } else {
            checks.push({ name: 'ProjectId: OK', status: 'success' });
            projectIdCheck = true;
        }


        // check for websiteId
        debugLog('websiteId:', websiteId);
        let websiteIdCheck = false;
        const expectedWebsiteId = urlParams.get('linkstormWebsiteId');
        if (!websiteId) {
            checks.push({ name: 'WebsiteId is not set in script tag', status: 'error' });
        } else if (isNaN(parseInt(websiteId))) {
            checks.push({ name: 'WebsiteId in script tag is not a number', status: 'error' });
        } else if (!expectedWebsiteId || parseInt(websiteId) !== parseInt(expectedWebsiteId)) {
            checks.push({ name: `WebsiteId in script tag (${websiteId}) does not match expected (${expectedWebsiteId || 'N/A'})`, status: 'error' });
        } else {
            checks.push({ name: 'WebsiteId: OK', status: 'success' });
            websiteIdCheck = true;
        }

        //check if website is enabled (based on URL param)
        debugLog('linkstormWebsiteEnabled param:', urlParams.get('linkstormWebsiteEnabled'));
        let websiteEnabledCheck = false;
        if (urlParams.get('linkstormWebsiteEnabled') !== '1') {
            checks.push({ name: 'Linkstorm service trial/subscription may not be active for this site.', status: 'error' });
        } else {
            checks.push({ name: 'Linkstorm service trial/subscription active: OK', status: 'success' });
            websiteEnabledCheck = true;
        }

        // Build popup content
        let checksHtml = '<ul style="list-style: none; padding: 0; margin: 0;">';
        checks.forEach(check => {
            let statusIcon = check.status === 'success' ? '✅' : '❌';
            let statusColor = check.status === 'success' ? 'green' : 'red';
            checksHtml += `<li style="margin: 5px 0; color: ${statusColor}; font-size: 1.1rem;">${statusIcon} ${check.name}</li>`;
        });
        checksHtml += '</ul>';

        let overallStatus = projectIdCheck && websiteIdCheck && websiteEnabledCheck;
        let statusMessage = overallStatus ?
            '<p style="color: green; font-weight: bold;">Installation looks OK!</p>' :
            '<p style="color: red; font-weight: bold;">There might be an issue with the installation.</p>';

        popup.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); text-align: left; max-width: 500px;">
                <h2 style="margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Linkstorm Installation Check</h2>
            ${checksHtml}
                ${statusMessage}
                 <p style="font-size: 0.8rem; color: #666; margin-top: 20px;">This popup is only shown when '?linkstormVerifyInstallation=true' is in the URL.</p>
                 <button onclick="this.parentNode.parentNode.remove()" style="margin-top: 15px; padding: 8px 15px; cursor: pointer;">Close</button>
        </div>`;
        document.body.appendChild(popup);

        return overallStatus; // Return the overall status
    };

    // --- Initialization Logic ---
    const injectUniqueTrackingId = () => {
        if (!document.body) {
            return;
        }

        // Prevent duplicate injection
        if (document.getElementById('linkstorm_verification_tag')) {
            return;
        }
        const verificationTagElement = document.createElement('div');
        verificationTagElement.id = "linkstorm_verification_tag";
        verificationTagElement.style.display = "none";
        verificationTagElement.dataset.projectId = projectId;
        verificationTagElement.dataset.websiteId = websiteId;
        document.body.appendChild(verificationTagElement);
    }

    const run = async () => {
        injectUniqueTrackingId();

        // Ensure this logic runs only once.
        if (initialized) {
            debugLog("run: Already initialized, skipping.");
            return;
        }
        initialized = true; // Set flag: initialization proceeds now
        debugLog("run: Initializing LinkstormLinker...");

        try {
            if (verifyInstallation) {
                debugLog('run: Verification mode active.');
                await verifyInstallationAndPopup();
                debugLog('run: Verification popup shown. Skipping link injection.');
                return; // Stop here in verification mode
            }

            debugLog('run: Link injection mode active. Starting link process.');
            await link();
            debugLog('run: Link process finished.');

        } catch (e) {
            errorLog('run: Error during initialization or linking:', e);
        }

        // --- Expose Public API ---
        window.LinkstormLinker = {
            // Core functionality (maybe?)
            // link, // Consider if exposing the main loop is needed

            // Test/Debug helpers
            verifyInstallationAndPopup,
            linkOpportunityInElement, // Test harness function
            findPotentialNodesForOpportunity,
            injectLinkInNode,
            linkOpportunity,
            getTextContainingElementsByXpath,
            setDebug,                 // Utility

            // Keep potentially used helpers (verify usage & necessity of export)
            cleanText,
            decodeHtml,
            encodeHtml,
        };

        debugLog("LinkstormLinker public API exposed.");
    };

    const init = () => {
        const runAfterMutations = () => {
            debugLog("runAfterMutations: Setting up MutationObserver to wait for DOM stability.");
            let debounceTimer;
            const observer = new MutationObserver(() => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    debugLog("runAfterMutations: DOM appears stable, executing run().");
                    observer.disconnect(); // Stop observing once we run
                    run();
                }, domSettlementTimeoutMs);
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Initial trigger in case the DOM is already stable or for non-SPA sites.
            debounceTimer = setTimeout(() => {
                debugLog("runAfterMutations: Initial timeout fired, DOM might be stable.");
                observer.disconnect();
                run();
            }, domSettlementTimeoutMs);
        };

        // Check if the DOM is already ready
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            debugLog("init: Document already ready, waiting for DOM to settle.");
            setTimeout(() => {
                runAfterMutations();
            }, domSettlementTimeoutMs);
        } else {
            // Wait for the DOM to be ready
            debugLog("init: Document not ready, waiting for DOMContentLoaded.");
            document.addEventListener('DOMContentLoaded', () => {
                debugLog("init: DOMContentLoaded fired, waiting for DOM to settle.");
                setTimeout(() => {
                    runAfterMutations();
                }, domSettlementTimeoutMs);
            }, { once: true });
        }
    };

    // --- Script Execution Start ---
    // Start the initialization process, by delay
    debugLog("LinkstormLinker script setting up to be executed after delay (ms) ...", delayLoadingMs);
    setTimeout(() => {
        injectUniqueTrackingId();
        debugLog("running init...");
        init();
    }, delayLoadingMs);

    // Fallback to ensure execution if events are missed, e.g., in complex loading scenarios.
    setTimeout(() => {
        debugLog("Fallback timeout reached, attempting to run if not already initialized.");
        injectUniqueTrackingId();
        run();
    }, delayLoadingMs + 2000); // Increased delay for SPAs

    document.addEventListener('DOMContentLoaded', () => {
        injectUniqueTrackingId();
        debugLog("init: DOMContentLoaded fired, waiting for DOM to settle.", Date.now());
    });

    // Inject verification tag immediately on script load (before waiting for DOM settlement)
    // This allows early detection that the script is running
    injectUniqueTrackingId();

})(window);