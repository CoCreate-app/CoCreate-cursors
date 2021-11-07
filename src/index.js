/*globals localStorage, ResizeObserver*/
import observer from '@cocreate/observer';
import message from '@cocreate/message-client';
import uuid from '@cocreate/uuid';
import { getElementPosition } from '@cocreate/selection';
import {randomColor} from '@cocreate/random-color';
import './index.css';

const clientId = window.CoCreateSockets.clientId || uuid.generate(12);
const cursorBackground = randomColor();

let enviroment_prod = true;
let documents = new Map();

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
    if (!documents.has(doc.window)) {
        initResizeObserver(doc.documentElement);
        documents.set(doc);
    }
}

var getCoordinates = function(element, position_start, position_end) {
    var mirrorDiv;
    let ID_MIRROR = element.getAttribute('mirror_id');
    let document = element.ownerDocument;
    mirrorDiv = document.getElementById(ID_MIRROR);

    if (!mirrorDiv) {
        mirrorDiv = document.createElement('div');
        mirrorDiv.id = ID_MIRROR;
        mirrorDiv.className = (enviroment_prod) ? 'mirror mirror_scroll mirror_color' : 'mirror mirror_scroll';
        mirrorDiv.contentEditable = false;
        mirrorDiv.element = element;
        element.insertAdjacentElement('afterend', mirrorDiv);
        _initEvents(element);
        initDocument(document);
    }

    let computed = getComputedStyle(element);
    let rect = element.getBoundingClientRect();
    let scrollBarWidth = 0;
    if (element.clientWidth != 0)
        scrollBarWidth = element.offsetWidth - element.clientWidth;
    let style = mirrorDiv.style;

    style.position = 'absolute';
    style.top = element.offsetTop + 'px';
    style.left = element.offsetLeft + 'px';
    style.width = rect.width + 'px';
    style.height = rect.height + 'px';
    style.visibility = 'visible';
    style.overflowX = computed['overflowX'];
    style.overflowY = computed['overflowY'];
    style.margin = '0px';
    style.paddingRight = parseInt(computed['paddingRight']) + scrollBarWidth + 'px';
    style.border = computed['border'];
    style.borderColor = 'transparent';

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


    let cursor_container = mirrorDiv.querySelectorAll('.cursor-container');
    let users_selections = mirrorDiv.querySelectorAll('.users_selections');

    let value_element = (['TEXTAREA', 'INPUT'].indexOf(element.nodeName) == -1) ? element.innerHTML : element.value;
    mirrorDiv.textContent = value_element.substring(0, position_start);

    if (element.nodeName === 'INPUT')
        mirrorDiv.textContent = mirrorDiv.textContent.replace(/\s/g, " ");


    var span = document.createElement('span');
    span.id = element.nodeName + 'span_selections';
    let value_span = value_element.substring(position_start, position_end) || '';
    span.textContent = value_span;
    mirrorDiv.appendChild(span);

    if (cursor_container) {
        cursor_container.forEach(function(child_cursor, index, array) {
            mirrorDiv.appendChild(child_cursor);
        });
    }

    if (users_selections) {
        users_selections.forEach(function(child_selection, index, array) {
            mirrorDiv.appendChild(child_selection);
        });
    }

    // create mirror text end
    let value_end = value_element.substring(position_end) || '';
    var span_end = document.createElement('span');
    mirrorDiv.appendChild(span_end);
    span_end.textContent = value_end;


    var coordinates = {
        start: {
            top: span.offsetTop,
            left: span.offsetLeft
        },
        end: {
            top: span_end.offsetTop,
            left: span_end.offsetLeft
        }
    };

    return coordinates;
};

function getStyle(el, styleProp) {
    if (window.getComputedStyle)
        var y = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    return y;
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
        selector += ':not(.codemirror, .quill, .monaco, [actions])';
        elements = document.querySelectorAll(selector);
    }
    for (let element of elements) {
        let realtime = element.getAttribute('realtime');
        let cursors = element.getAttribute('cursors');
        if (realtime == 'false' || cursors == 'false') continue;
        if (element.tagName == 'IFRAME') {
            let domTextEditor = element.contentDocument.documentElement;
            let pos = getElementPosition(domTextEditor.htmlString, start, end);
            element = domTextEditor.querySelector(pos.path);
            let endPos = end - start;
            if (endPos > 0)
                end = pos.start + endPos;
            else
                end = pos.start;
            start = pos.start;
        }
        if(!element) return;
        let document = element.ownerDocument;
        let id_mirror = element.getAttribute('mirror_id');
        if (!id_mirror)
            element.setAttribute('mirror_id', uuid.generate(8));
        id_mirror = element.getAttribute('mirror_id');
        let coordinates = getCoordinates(element, start, end);
        if (!coordinates) return false;

        let elementMirror = document.getElementById(id_mirror);
        let cursor;
        // let selection_user = false;
        // let user = (typeof(selection) != 'undefined' && selection.hasOwnProperty('user')) ? selection.user : false;
        // let user_id = (typeof(selection) != 'undefined' && selection.hasOwnProperty('user_id')) ? user.user_id : false;
        if (socket_id) {
            var cursores_other_elements = document.querySelectorAll('#socket_' + socket_id);
            cursores_other_elements.forEach(function(child_cursor, index, array) {
                if (child_cursor.parentElement.getAttribute('id') != id_mirror) {
                    child_cursor.remove();
                }
            });
            cursor = elementMirror.querySelector('.cursor-container#socket_' + socket_id);
            if (!cursor) {
                let cursor_template = '<div class="cursor-container" \
                                        id="socket_' + socket_id + '"  \
                                        style="background-color:' + selection.background + '"> \
                                          <div class="cursor-flag" \
                                              collection="users" \
                                              document_id="' + selection.user_id + '" \
                                              name="name">' + selection.userName + '</div>\
                                          </div>';
                elementMirror.innerHTML = cursor_template + elementMirror.innerHTML;
            }
        }
        cursor = elementMirror.querySelector('.cursor-container#socket_' + socket_id);
        if (cursor) {
            let font_size = getStyle(element, 'font-size');
            font_size = parseFloat(font_size.substring(0, font_size.length - 2));
            let cursor_height = ((font_size * 112.5) / 100);
            // let my_cursor = cursor.querySelector('.cursor');
            let cursorFlag = cursor.querySelector('.cursor-flag');
            cursor.dataset.start = start;
            cursor.dataset.end = end;
            cursor.setAttribute('socket_id', socket_id);
            cursor.setAttribute('user-name', selection.userName);
            cursor.setAttribute('user-background', selection.background);
            cursor.setAttribute('user-color', selection.color);
            cursor.style["height"] = cursor_height + "px";
            cursor.style["background"] = selection.background;
            cursorFlag.style["background"] = selection.background;
            cursorFlag.innerHTML = selection.userName;
            cursor.style["left"] = coordinates.end.left + "px";

            let selection_user = document.getElementById('sel-' + socket_id);
            if (selection_user) {
                selection_user.remove();
            }
            if ((start != end)) {
                var scrollwidth = element.offsetWidth - element.scrollWidth;
                var padding_right = parseInt(getComputedStyle(element)["paddingRight"]);

                selection_user = document.createElement('span');
                selection_user.id = 'sel-' + socket_id;
                selection_user.className = 'users_selections';
                let style_mirror = getComputedStyle(elementMirror);
                selection_user.style["position"] = "absolute";
                selection_user.style["top"] = style_mirror.paddingTop;
                selection_user.style["left"] = style_mirror.paddingLeft;
                selection_user.style["padding-right"] = scrollwidth + padding_right + "px";
                elementMirror.insertBefore(selection_user, elementMirror.firstChild);
                let selection_span_by_user = document.createElement('span');
                selection_span_by_user.id = 'selection-' + socket_id;
                selection_span_by_user.style.backgroundColor = selection.background;
                let value_element = (['TEXTAREA', 'INPUT'].indexOf(element.nodeName) == -1) ? element.innerHTML : element.value;
                selection_user.textContent = value_element.substring(0, start);
                let value_span_selection = value_element.substring(start, end) || '';
                selection_span_by_user.textContent = value_span_selection;
                selection_user.appendChild(selection_span_by_user);
            }
        }
        scrollMirror(element);
    }
}

function updateCursors(element) {
    let mirrorDivs;
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
        let cursor_containers = mirrorDiv.querySelectorAll('.cursor-container');

        cursor_containers.forEach(function(child_cursor, index, array) {
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
    let elements = document.querySelectorAll('[id*="socket_' + clientId + '"]');
    elements.forEach(function(element, index, array) {
        element.parentNode.removeChild(element);
    });

    let sel_elements = document.querySelectorAll('[id*="sel-' + clientId + '"]');
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
            emit: {
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
            },
        });
    }
    catch (e) {
        console.error(e);
    }
}


message.listen('cursor', function(selection) {
    if (selection.clientId == clientId) return;
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
