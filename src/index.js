/*globals localStorage, ResizeObserver*/
import observer from '@cocreate/observer';
import message from '@cocreate/message-client';
import uuid from '@cocreate/uuid';
import { getElementPosition } from '@cocreate/selection';
import {randomColor} from '@cocreate/random-color';
import './index.css';

const clientId = window.CoCreateSockets.clientId || uuid.generate(12);
const cursorBackground = randomColor();

let environment_prod = true;

let selector = "[collection][document_id][name]:not([contentEditable='false'])";

function init() {
    let elements = document.querySelectorAll(selector);
    initElements(elements);
}

function initElements(elements) {
    for (let element of elements)
        initElement(element);
}

function initElement(element) {
    let realtime = element.getAttribute('realtime');
    let cursors = element.getAttribute('cursors');
    if (realtime == 'false' || cursors == 'false') return;
    if (element.hasAttribute('actions')) return;
    if (element.cursor) return;
    element.cursor = true;
}

function initDocument(doc) {
    let documents = window.top.cursorDocuments;
    if (!documents){
        documents = new Map();
        window.top.cursorDocuments = documents;
    }
    if (!documents.has(doc)) {
        initResizeObserver(doc.documentElement);
        documents.set(doc);
    }
}

function drawCursors(selection) {
    const socket_id = selection['clientId'];
    const collection = selection['collection'];
    const document_id = selection['document_id'];
    const name = selection['name'];
    let start = selection['start'];
    let end = selection['end'];
    let elements = selection.element;
    if (!elements) {
        let selector = '[collection="' + collection + '"][document_id="' + document_id + '"][name="' + name + '"]';
        selector += ':not(.codemirror, .monaco, [actions])';
        elements = document.querySelectorAll(selector);
    }
    for (let element of elements) {
        if (window.activeElement == element && selection.clientId == clientId) {
            continue;
        }
        let realtime = element.getAttribute('realtime');
        let cursors = element.getAttribute('cursors');
        let contenteditable = element.getAttribute('contenteditable');
        if (realtime == 'false' || cursors == 'false') continue;
        if (element.tagName != 'INPUT' && element.tagName != 'TEXTAREA')
            if (contenteditable == 'false' || contenteditable == null)
                if (cursors != 'true') continue;
        
        if (element.hasAttribute('contenteditable')) {
            let domTextEditor = element;
            if (element.tagName == 'IFRAME'){
                // let frameClientId = element.contentDocument.defaultView.CoCreateSockets.clientId;
                // if (frameClientId == selection.clientId) continue;
                domTextEditor = element.contentDocument.documentElement;
            }
            let pos = getElementPosition(domTextEditor.htmlString, start, end);
            if (pos.start){
                if(pos.path)
                    element = domTextEditor.querySelector(pos.path);
                let endPos = end - start;
                if (endPos > 0)
                    end = pos.start + endPos;
                else
                    end = pos.start;
                start = pos.start;
            }
        }

        if(!element) continue;
        let document = element.ownerDocument;
        let mirrorDiv;
        let id_mirror = element.getAttribute('mirror_id');
        if (!id_mirror){
            id_mirror = uuid.generate(8);
            element.setAttribute('mirror_id', id_mirror);
            
            mirrorDiv = document.createElement('cursor-container');
            mirrorDiv.id = id_mirror;
            mirrorDiv.className = (environment_prod) ? 'mirror mirror_scroll mirror_color' : 'mirror mirror_scroll';
            mirrorDiv.contentEditable = false;
            mirrorDiv.element = element;
            element.insertAdjacentElement('afterend', mirrorDiv);
            // let parent = element.parentElement;
            // let parentComputed = getComputedStyle(parent);
            // let parentStylePosition = parentComputed['position'];
            // if (parentStylePosition == 'static')
            //     parent.style.position = 'relative';
            // let parentStyleDisplay = parentComputed['display'];
            // if (parentStyleDisplay == 'inline')
            //     parent.style.display = 'inline';

            _initEvents(element);
            initDocument(document);
        }
        else
            mirrorDiv = document.getElementById(id_mirror);
        
        let computed = getComputedStyle(element);
        let rect = element.getBoundingClientRect();
        let borderWidth = parseInt(computed['border-width']) * 2;
        let scrollBarWidth = 0;
        if (element.clientWidth != 0)
            scrollBarWidth = element.offsetWidth - element.clientWidth - borderWidth;
        let style = mirrorDiv.style;
        
        style.position = 'absolute';
        style.width = rect.width + 'px';
        style.height = rect.height + 'px';
        style.visibility = 'visible';
        style.overflowX = computed['overflowX'];
        style.overflowY = computed['overflowY'];
        style.margin = '0px';
        style.paddingRight = parseInt(computed['paddingRight']) + scrollBarWidth + 'px';
        style.border = computed['border'];
        style.borderColor = 'transparent';
        
        if (element.parentElement.style['display'] == 'inline') {
            style.top = element.clientTop + 'px';
            style.left = element.clientLeft + 'px';
        }
        else {
            style.top = element.offsetTop + 'px';
            style.left = element.offsetLeft + 'px';
        }
        
        if (element.nodeName !== 'INPUT') {
            style.wordWrap = 'break-word';
            style.whiteSpace = 'pre-wrap';
        }
        else {
            style.whiteSpace = 'pre';
        }
    
        let properties = ['boxSizing', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'paddingTop', 'paddingBottom', 'paddingLeft', 'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing', 'textRendering', 'webkitWritingMode', 'textTransform', 'textIndent', 'overflowWrap'];
    
        properties.forEach(function(prop) {
            if (['left', 'top'].indexOf(prop.toLowerCase()) === -1)
                style[prop] = computed[prop];
        });
    
        let spanText = mirrorDiv.querySelector('span-text');
        if (!spanText)
            spanText = document.createElement('span-text');
            spanText.style['display'] = 'block';
        let value_element = (['TEXTAREA', 'INPUT'].indexOf(element.nodeName) == -1) ? element.innerHTML : element.value;
        
        spanText.textContent = value_element;
        if (element.nodeName === 'INPUT')
            spanText.textContent = mirrorDiv.textContent.replace(/\s/g, " ");
        mirrorDiv.appendChild(spanText);
        let cursor, cursorFlag;
        let details = {collection, document_id, name};
        if (socket_id) {
            let userSelections = document.querySelectorAll(`selection[socket_id="${socket_id}"]`);
            if (userSelections) {
                for (let userSelection of userSelections){
                    if (userSelection.details != details)
                        userSelection.remove();
                }
            }
            let selection_user = mirrorDiv.querySelector(`selection[socket_id="${socket_id}"]`);
            if (!selection_user){
                selection_user = document.createElement('selection');
                selection_user.setAttribute('socket_id', socket_id);
                selection_user.style["position"] = "absolute";
                let style_mirror = getComputedStyle(mirrorDiv);
                selection_user.style["top"] = style_mirror.paddingTop;
                selection_user.style["left"] = style_mirror.paddingLeft;
                selection_user.style["width"] = mirrorDiv.clientWidth - parseInt(computed['padding-left']) - parseInt(computed['padding-right']) - scrollBarWidth + 'px';
                selection_user.details = {collection, document_id, name};
                
                mirrorDiv.appendChild(selection_user);
            }
            
            let value_element = (['TEXTAREA', 'INPUT'].indexOf(element.nodeName) == -1) ? element.innerHTML : element.value;
            selection_user.textContent = value_element.substring(0, start);
            
            let value_end = value_element.substring(end) || '';
            let span_end = document.createElement('span-end');
            span_end.textContent = value_end;
            
            cursor = document.createElement('cursor');
            cursor.setAttribute('socket_id', socket_id);
            cursor.dataset.start = start;
            cursor.dataset.end = end;
            cursor.setAttribute('user-name', selection.userName);
            cursor.setAttribute('user-background', selection.background);
            cursor.setAttribute('user-color', selection.color);
            cursor.style["background"] = selection.background;
            cursor.details = {collection, document_id, name};
            cursor.textContent = "1";
            span_end.prepend(cursor);
            
            let selectedText = document.createElement('selected-text');
            selectedText.style["backgroundColor"] = selection.background;
            selectedText.textContent = value_element.substring(start, end) || '';
            span_end.prepend(selectedText);
            
            cursorFlag = document.createElement('cursor-flag');
            cursorFlag.setAttribute('collection', 'users');
            cursorFlag.setAttribute('document_id', selection.user_id);
            cursorFlag.setAttribute('name', 'name');
            cursorFlag.style["background"] = selection.background;
            cursorFlag.innerHTML = selection.userName;
            cursor.appendChild(cursorFlag);
            
            selection_user.appendChild(span_end);
        }
        scrollMirror(element);
    }
}

function updateCursors(element) {
    let mirrorDivs = [];
    let id_mirror = element.getAttribute('mirror_id');
    if (id_mirror) {
        let mirrorDiv = element.ownerDocument.getElementById(id_mirror);
        if (mirrorDiv)
            mirrorDivs = [mirrorDiv];
    }
    else {
        mirrorDivs = element.querySelectorAll('.mirror');
    }
    for (let mirrorDiv of mirrorDivs) {
        element = mirrorDiv.element;
        let cursors = mirrorDiv.querySelectorAll('cursor');

        cursors.forEach(function(child_cursor, index, array) {
            let clientId = child_cursor.getAttribute('socket_id');
            let userName = child_cursor.getAttribute('user-name');
            let background = child_cursor.getAttribute('user-background');
            let color = child_cursor.getAttribute('user-color');
            let start = child_cursor.getAttribute('data-start');
            let end = child_cursor.getAttribute('data-end');
            let selection = {
                element: [element],
                start,
                end,
                clientId,
                userName,
                background,
                color
            };
            drawCursors(selection);
        });
    }
}

function removeCursor(clientId) {
    let elements = document.querySelectorAll(`cursor[socket_id="${clientId}"]`);
    elements.forEach(function(element, index, array) {
        element.parentNode.removeChild(element);
    });

    let sel_elements = document.querySelectorAll(`selection[socket_id="${clientId}"]`);
    sel_elements.forEach(function(sel_element, index, array) {
        sel_element.parentNode.removeChild(sel_element);
    });
}

function _initEvents(element) {
    element.addEventListener('keydown', function(event) {
        scrollMirror(element);
    });

    element.addEventListener('scroll', function() {
        scrollMirror(element);
    });

    initResizeObserver(element);
}

function scrollMirror(element) {
    let id_mirror = element.getAttribute('mirror_id');
    let elementMirror = document.getElementById(id_mirror);
    if (elementMirror)
        elementMirror.scrollTo(element.scrollLeft, element.scrollTop);
}


function initResizeObserver(element) {
    const watch = new ResizeObserver(() => updateCursors(element));
    watch.observe(element);
}

function sendPosition(info) {
    try {
        message.send({
            room: "",
            message: "cursor",
            data: {
                collection: info.collection,
                document_id: info.document_id,
                name: info.name,
                start: info.start,
                end: info.end,
                clientId: clientId,
                color: info.color || localStorage.getItem("cursorColor"),
                background: info.background || localStorage.getItem("cursorBackground") || cursorBackground,
                userName: info.userName || localStorage.getItem("userName") || clientId,
                user_id: info.user_id || localStorage.getItem("user_id") || clientId
            }
        });
    }
    catch (e) {
        console.error(e);
    }
}


message.listen('cursor', function(response) {
    // if (selection.clientId == clientId) return;
    let selection = response.data
    if (selection.start != null && selection.end != null)
        drawCursors(selection);
    else
        removeCursor(selection.clientId);
});

observer.init({
    name: 'CoCreateCursor',
    observe: ['addedNodes'],
    target: '[collection][document_id][name]',
    callback: function(mutation) {
        initElement(mutation.target);
    }
});

observer.init({
    name: 'CoCreateCursorAtt',
    observe: ['attributes'],
    attributeName: ['collection', 'document_id', 'name'],
    callback: function(mutation) {
        initElement(mutation.target);
    }
});

init();

export default { drawCursors, updateCursors, removeCursor, sendPosition };
