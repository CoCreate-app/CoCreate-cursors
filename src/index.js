import observer from '@cocreate/observer';
import uuid from '@cocreate/uuid';
import './index.css';

let enviroment_prod = true;

let elements; 
let selector = "[collection][document_id][name], [collection][document_id][name][contenteditable]:not([contentEditable='false'])";

function init() {
    elements = document.querySelectorAll(selector);
    initElements(elements);
}  


function initElements(elements) {
    for(let element of elements)
        initElement(element);
}

function initElement(element) {
    let realtime = element.hasAttribute('realtime') ? element.getAttribute('realtime') : 'true';
    if(realtime == 'false') return false;
    _initEvents(element);
}

var getCaretCoordinates = function(element, position_start, position_end) {
    var mirrorDiv;
    let ID_MIRROR = element.dataset['mirror_id']; //document_id + name +  '--mirror-div';
    mirrorDiv = document.getElementById(ID_MIRROR);

    if(!mirrorDiv) {
        mirrorDiv = document.createElement('div');
        mirrorDiv.id = ID_MIRROR; //document_id +name+ '--mirror-div';
        mirrorDiv.className = (enviroment_prod) ? 'mirror_color mirror_scroll mirror-width-scroll' : 'mirror-width-scroll';
        element.insertAdjacentElement('afterend', mirrorDiv);
    }

    let computed = getComputedStyle(element);
    let rect = element.getBoundingClientRect();
    let style = mirrorDiv.style;

    style.position = 'absolute';
    style.top = element.offsetTop + 'px';
    style.left = element.offsetLeft + 'px';
    style.width = rect.width + 'px'; 
    style.height = rect.height + 'px';
    style.visibility = 'visible';
    style.overflowX = 'auto';
    style.overflowY = 'hidden';
    style.margin = '0px';
    style.border = computed['border'];
    style.borderColor = 'transparent';
    
    if(element.nodeName !== 'INPUT') {
        style.wordWrap = 'break-word'; 
        style.whiteSpace = 'pre-wrap';
    }
    else {
        style.whiteSpace = 'pre';
    }
    
    let properties = ['boxSizing', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent', 'textDecoration', 'letterSpacing', 'wordSpacing', 'textRendering', 'webkitWritingMode', 'textTransform', 'textIndent', 'overflowWrap'];
    
    properties.forEach(function(prop) {
        if(['left', 'top'].indexOf(prop.toLowerCase()) === -1)
            style[prop] = computed[prop];
    });

    
    let cursor_container = mirrorDiv.querySelectorAll('.cursor-container');
    let users_selections = mirrorDiv.querySelectorAll('.users_selections');
    
    let value_element = (['TEXTAREA', 'INPUT'].indexOf(element.nodeName) == -1) ? element.innerHTML : element.value;
    mirrorDiv.textContent = value_element.substring(0, position_start);
    
    if(element.nodeName === 'INPUT')
        mirrorDiv.textContent = mirrorDiv.textContent.replace(/\s/g, "\u00a0");
    
        
    var span = document.createElement('span');
    span.id = element.nodeName + 'span_selections';
    let value_span = value_element.substring(position_start, position_end) || '';
    span.textContent = value_span; 
    mirrorDiv.appendChild(span);

    if(cursor_container) {
        cursor_container.forEach(function(child_cursor, index, array) {
            mirrorDiv.appendChild(child_cursor);
        });
    }

    if(users_selections) {
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
    if(window.getComputedStyle)
        var y = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    return y;
}

function drawCursors(selection) {
	const collection = selection['collection'];
	const document_id = selection['document_id'];
	const name = selection['name'];
    const start = selection['start'];
    const end = selection['end'];
    const socket_id = selection['clientId'];	
	
	let selector = '[collection="'+collection+'"][document_id="'+document_id+'"][name="'+name+'"]';
	selector += ':not(.codemirror):not(.quill):not(.monaco)';
	let elements = document.querySelectorAll(selector);
    for(let element of elements) {

        if(typeof element.dataset['mirror_id'] == 'undefined' || element.dataset['mirror_id'] == '')
            element.dataset['mirror_id'] = uuid.generate(30);
        let coordinates = getCaretCoordinates(element, start, end);
        if(!coordinates)
            return false;
        let id_mirror = element.dataset['mirror_id']; //document_id+name+'--mirror-div'
        let elementMirror = document.getElementById(id_mirror);
        let cursor = false;
        let selection_user = false;
        let identify = '_' + id_mirror;
        let user = (typeof(selection) != 'undefined' && selection.hasOwnProperty('user')) ? selection.user : false;
        let user_id = (typeof(selection) != 'undefined' && selection.hasOwnProperty('user_id')) ? user.user_id : false;
        if(socket_id) {
            var cursores_other_elements = document.querySelectorAll('#socket_' + socket_id + identify);
            cursores_other_elements.forEach(function(child_cursor, index, array) {
                if(child_cursor.parentElement.getAttribute('id') != id_mirror) {
                    child_cursor.remove();
                }
            });
            cursor = elementMirror.querySelector('.cursor-container#socket_' + socket_id + identify);
            if(!cursor && selection.hasOwnProperty('user')) {
                if(user) {
                    let cursor_template = '<div style="color:blue;" class="cursor-container" \
                                            id="socket_' + socket_id + identify + '" \
                                              ><div class="cursor" \
                                              style="background-color:' + user.color + '"></div>\
                                              <div class="cursor-flag" collection="users" \
                                              user-name="' + user.name + '" \
                                              user-color="' + user.color + '" \
                                              data-socket_id="' + socket_id + '" \
                                              data-id_mirror="' + id_mirror + '" \
                                              collection="users" \
                                              document_id="' + user_id + '" \
                                              name="name" \
                                              style="background-color:' + user.color + '" \
                                              >' + user.name + '</div></div>';
                    elementMirror.innerHTML = cursor_template + elementMirror.innerHTML;
                }
            }
        }
        cursor = elementMirror.querySelector('.cursor-container#socket_' + socket_id + identify);
        if(cursor) {
            let font_size = getStyle(element, 'font-size');
            font_size = parseFloat(font_size.substring(0, font_size.length - 2));
            let cursor_height = ((font_size * 112.5) / 100);
            let my_cursor = cursor.querySelector('.cursor');
            cursor.dataset.start = start;
            cursor.dataset.end = end;
            cursor.dataset.socket_id = socket_id;

            cursor.style["top"] = coordinates.end.top + "px";
            cursor.style["width"] = "2px"; //2px
            my_cursor.style["height"] = cursor_height + "px";
            cursor.style["left"] = coordinates.end.left + "px";

            selection_user = document.getElementById('sel-' + socket_id + identify);
            if(selection_user) {
                selection_user.remove();
            }
            if((start != end) && user) {
                // selection_user = document.getElementById('sel-' + socket_id + identify)
                var scrollwidth = element.offsetWidth - element.scrollWidth;
                var padding_right = parseInt(getComputedStyle(element)["paddingRight"]);
                
                selection_user = document.createElement('span');
                selection_user.id = 'sel-' + socket_id + identify;
                selection_user.className = 'users_selections';
                let style_mirror = getComputedStyle(elementMirror);
                selection_user.style["position"] = "absolute";
                selection_user.style["top"] = style_mirror.paddingTop;
                selection_user.style["left"] = style_mirror.paddingLeft;
                selection_user.style["padding-right"] = scrollwidth + padding_right + "px";
                elementMirror.insertBefore(selection_user, elementMirror.firstChild);
                let selection_span_by_user = document.createElement('span');
                selection_span_by_user.id = 'selection-' + socket_id + identify;
                selection_span_by_user.style.backgroundColor = user.color;
                let value_element = (['TEXTAREA', 'INPUT'].indexOf(element.nodeName) == -1) ? element.innerHTML : element.value;
                selection_user.textContent = value_element.substring(0, start);
                let value_span_selection = value_element.substring(start, end) || '';
                console.log("Selection ", value_span_selection, start, end);
                selection_span_by_user.textContent = value_span_selection;
                selection_user.appendChild(selection_span_by_user);
            } 
        }
    } 
}

function updateCursors(element, count) {
    // let {collection, document_id, name} = crud.getAttr(element)
    let my_start = (!element.hasAttribute('contenteditable')) ? element.selectionStart : parseInt(element.getAttribute("selection_start"));
    let id_mirror = element.dataset['mirror_id']; //let id_mirror = document_id+name+'--mirror-div';
    let mirrorDiv = document.getElementById(id_mirror);
    let cursor_container = (mirrorDiv) ? mirrorDiv.querySelectorAll('.cursor-container') : null;
    if(cursor_container) {
        let containers_cursors = [];
        cursor_container.forEach(function(child_cursor, index, array) {
            let start = parseInt(child_cursor.getAttribute('data-start'));
            let user_name = child_cursor.getAttribute('user-name');
            if(start > my_start && containers_cursors.indexOf(user_name) == -1) {
                let end = parseInt(child_cursor.getAttribute('data-end'));
                let pos_start = start + count;
                let pos_end = end + count;
                let dataset = child_cursor.querySelector('.cursor-flag').dataset;
                let clientId = dataset.socket_id;
                let selection = {
                    element: element,
                    startn: pos_start,
                    end: pos_end,
                    clientId: clientId,
                    'user': {
                        'color': dataset.user_color,
                        'name': dataset.user_name
                    },
                };
                drawCursors(selection);
                containers_cursors.push(user_name);
            }

        });
    }
}

function removeCursor(clientId){
   let elements = document.querySelectorAll('[id*="socket_'+clientId+'"]');
	elements.forEach(function (element, index, array) {
		element.parentNode.removeChild(element);
	});
	
	let sel_elements = document.querySelectorAll('[id*="sel-'+clientId+'"]');
	  sel_elements.forEach(function (sel_element, index, array) {
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

    function scrollMirror(element) {
        let id_mirror = element.dataset['mirror_id'];
        let elementMirror = document.getElementById(id_mirror);
        if(elementMirror)
            elementMirror.scrollTo(element.scrollLeft, element.scrollTop);
    }
    
    function outputsize() {
        elements.forEach(function(element_for, index, array) {
            let id_mirror = element.dataset['mirror_id'];
            let elementMirror = document.getElementById(id_mirror);
            if(elementMirror) {
                elementMirror.style["width"] = element_for.offsetWidth + "px";
                elementMirror.style["height"] = element_for.offsetHeight + "px";
                var isFocused = (document.activeElement === element);
                if(isFocused)
                    getCaretCoordinates(element, element.selectionStart, element.selectionEnd);
            }
        });
    }
    
    new ResizeObserver(outputsize).observe(element)

}

init();

observer.init({
    name: 'CoCreateCursor',
    observe: ['addedNodes'],
    target: '[collection][document_id][name]',
    callback: function(mutation) {
        initElement(mutation.target);
    }
});

const CoCreateCursors = { drawCursors, updateCursors, removeCursor };
export default CoCreateCursors;