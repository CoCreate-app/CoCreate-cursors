import observer from '@cocreate/observer'
import crud from '@cocreate/crud-client';
import uuid from '@cocreate/uuid';
import './index.css';


let enviroment_prod = true;

let elements; 
let selector = "[collection][document_id][name], [collection][document_id][name][contenteditable]:not([contentEditable='false'])";

function init() {
    elements = document.querySelectorAll(selector)
    initElements(elements);
}  


function initElements(elements) {
    for(let element of elements)
        initElement(element);
}

function initElement(element) {
    let realtime = element.hasAttribute('realtime') ? element.getAttribute('realtime') : 'true';
    if(realtime == 'false') return false;
    _initevents(element)
}

var mirrorDiv, computed, style;

var getCaretCoordinates = function(element, position_start, position_end) {
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
    style.visibility = 'visible'
    style.overflowX = 'auto';
    style.overflowY = 'hidden';
    style.margin = '0px'
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
    let value_span = value_element.substring(position_start, position_end) || ''
    span.textContent = value_span; 
    mirrorDiv.appendChild(span);

    if(cursor_container) {
        cursor_container.forEach(function(child_cursor, index, array) {
            mirrorDiv.appendChild(child_cursor);
        })
    }

    if(users_selections) {
        users_selections.forEach(function(child_selection, index, array) {
            mirrorDiv.appendChild(child_selection);
        })
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
}

function getStyle(el, styleProp) {
    if(window.getComputedStyle)
        var y = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    return y;
}

// crud.listen('readDocument', function(data) {
//     let cursor = document.querySelector('.cursor-flag[document_id="' + data['document_id'] + '"]')
//     if(cursor)
//         cursor.innerHTML = data.result[cursor.getAttribute('name')]
// })


function draw_cursor(json) {
    let element = json['element'];
    let activate_cursor = (element.dataset['cursors']) ? element.dataset['mirror_id'] : true;
    if(activate_cursor) {
        let start = json['startPosition']
        let end = json['endPositon']
        let socket_id = json['clientId']
        let document_id = element.getAttribute('document_id') || '';
        if(document_id != '') {
            if(typeof element.dataset['mirror_id'] == 'undefined' || element.dataset['mirror_id'] == '')
                element.dataset['mirror_id'] = uuid.generate(30)
            let coordinates = getCaretCoordinates(element, start, end);
            if(!coordinates)
                return false;
            let name = element.getAttribute('name')
            let id_mirror = element.dataset['mirror_id']; //document_id+name+'--mirror-div'
            let mi_mirror = document.getElementById(id_mirror)
            let cursor = false;
            let selection_user = false;
            let identify = '_' + id_mirror;
            let user = (typeof(json) != 'undefined' && json.hasOwnProperty('user')) ? json.user : false
            let user_id = (typeof(json) != 'undefined' && json.hasOwnProperty('user_id')) ? user.user_id : false
            if(socket_id) {
                //if(data && data.hasOwnProperty('id_mirror')){
                var cursores_other_elements = document.querySelectorAll('#socket_' + socket_id + identify)
                cursores_other_elements.forEach(function(child_cursor, index, array) {
                    if(child_cursor.parentElement.getAttribute('id') != id_mirror) {
                        child_cursor.remove()
                    }
                })
                //}
                cursor = mi_mirror.querySelector('.cursor-container#socket_' + socket_id + identify);
                if(!cursor && json.hasOwnProperty('user')) {
                    if(user) {
                        let cursor_template = '<div style="color:blue;" class="cursor-container" \
                                                  id="socket_' + socket_id + identify + '" \
                                                  ><div class="cursor" \
                                                  style="background-color:' + user.color + '"></div>\
                                                  <div class="cursor-flag" collection="users" \
                                                  data-user_name="' + user.name + '" \
                                                  data-user_color="' + user.color + '" \
                                                  data-socket_id="' + socket_id + '" \
                                                  data-id_mirror="' + id_mirror + '" \
                                                  collection="users" \
                                                  document_id="' + user_id + '" \
                                                  name="name" \
                                                  style="background-color:' + user.color + '" \
                                                  flag>' + user.name + '</div></div>';
                        mi_mirror.innerHTML = cursor_template + mi_mirror.innerHTML;

                    }
                    // if(user_id) {
                    //     // si tiene user_id actualiza el nombre del cursor usando crud
                    //     crud.readDocument({
                    //         'collection': 'users',
                    //         'document_id': user_id
                    //     })
                    // }
                }
                cursor = mi_mirror.querySelector('.cursor-container#socket_' + socket_id + identify);
            }
            if(cursor) {
                let font_size = getStyle(element, 'font-size')
                font_size = parseFloat(font_size.substring(0, font_size.length - 2));
                let cursor_height = ((font_size * 112.5) / 100)
                let my_cursor = cursor.querySelector('.cursor')
                cursor.dataset.start = start
                cursor.dataset.end = end
                cursor.dataset.socket_id = socket_id

                cursor.style["top"] = coordinates.end.top + "px";
                cursor.style["width"] = "2px"; //2px
                my_cursor.style["height"] = cursor_height + "px";
                cursor.style["left"] = coordinates.end.left + "px";

                
                //add selections
                selection_user = document.getElementById('sel-' + socket_id + identify);
                if(selection_user) {
                    selection_user.remove()
                }
                if((start != end) && user) {
                    // selection_user = document.getElementById('sel-' + socket_id + identify)
                    var scrollwidth = element.offsetWidth - element.scrollWidth;
                    var padding_right = parseInt(getComputedStyle(element)["paddingRight"])
                    
                    selection_user = document.createElement('span');
                    selection_user.id = 'sel-' + socket_id + identify;
                    selection_user.className = 'users_selections'
                    let style_mirror = getComputedStyle(mi_mirror)
                    selection_user.style["position"] = "absolute";
                    selection_user.style["top"] = style_mirror.paddingTop;
                    selection_user.style["left"] = style_mirror.paddingLeft;
                    selection_user.style["padding-right"] = scrollwidth + padding_right + "px";
                    mi_mirror.insertBefore(selection_user, mi_mirror.firstChild);
                    let selection_span_by_user = document.createElement('span');
                    selection_span_by_user.id = 'selection-' + socket_id + identify;
                    selection_span_by_user.style.backgroundColor = user.color;
                    let value_element = (['TEXTAREA', 'INPUT'].indexOf(element.nodeName) == -1) ? element.innerHTML : element.value;
                    selection_user.textContent = value_element.substring(0, start);
                    let value_span_selection = value_element.substring(start, end) || ''
                    console.log("Selection ", value_span_selection, start, end)
                    //selection_span_by_user.style.opacity = 0.5;
                    selection_span_by_user.textContent = value_span_selection;
                    selection_user.appendChild(selection_span_by_user)
                } //end Selections
                // else {
                //     if(selection_user) {
                //         selection_user.remove()
                //     }
                // }
            }
        } 
    } 
} 


// Todo: is this same as recalculate cursor
function refresh_mirror(element) {

    let id_mirror = element.dataset['mirror_id']
    if(!id_mirror) return;
   
    var mi_mirror = document.getElementById(id_mirror)
    if(mi_mirror) {
        computed = getComputedStyle(element);
        style = mi_mirror.style
        style.width = element.offsetWidth - (parseInt(computed.borderLeftWidth) + parseInt(computed.borderRightWidth)) + 'px'
        style.height = element.offsetHeight - (parseInt(computed.borderTopWidth) + parseInt(computed.borderBottomWidth)) + 'px'
        var cursor_container = mi_mirror.querySelectorAll('.cursor-container');
        cursor_container.forEach(function(child_cursor, index, array) {
            let child = child_cursor.querySelector('.cursor-flag');
            let dataset_child = child.dataset;
            let dataset = child_cursor.dataset;
            draw_cursor({
                element: element,
                startPosition: dataset.start,
                endPositon: dataset.end,
                clientId: dataset.socket_id,
                user: {
                    'color': dataset_child.user_color,
                    'name': dataset.user_name
                },
            });
        })
    }
} 

function recalculate_local_cursors(element, count) {
    let my_start = (!element.hasAttribute('contenteditable')) ? element.selectionStart : parseInt(element.getAttribute("selection_start"));
    let id_mirror = element.dataset['mirror_id']; //let id_mirror = document_id+name+'--mirror-div';
    let mirrorDiv = document.getElementById(id_mirror);
    let cursor_container = (mirrorDiv) ? mirrorDiv.querySelectorAll('.cursor-container') : null;
    if(cursor_container) {
        let containers_cursors = [];
        cursor_container.forEach(function(child_cursor, index, array) {
            let start = parseInt(child_cursor.getAttribute('data-start'));
            let user_name = child_cursor.getAttribute('data-user_name');
            if(start > my_start && containers_cursors.indexOf(user_name) == -1) {
                let end = parseInt(child_cursor.getAttribute('data-end'));
                let pos_start = start + count;
                let pos_end = end + count;
                let dataset = child_cursor.querySelector('.cursor-flag').dataset
                let clientId = dataset.socket_id;
                let json = {
                    element: element,
                    startPosition: pos_start,
                    endPositon: pos_end,
                    clientId: clientId,
                    'user': {
                        'color': dataset.user_color,
                        'name': dataset.user_name
                    },
                }
                draw_cursor(json);
                containers_cursors.push(user_name);
            }

        })
    }
}


function _initevents(element) {

    element.addEventListener('mousemove', function(event) {
        scrollMirror(element)
    });

    element.addEventListener('focusout', function(event) {
        scrollMirror(element)
    })

    element.addEventListener('keydown', function(event) {
        scrollMirror(element)
        // let name = element.getAttribute('name')
        // let id_mirror = element.dataset['mirror_id'];
        // let mi_mirror = document.getElementById(id_mirror)
        // if(mi_mirror) {
        //     mi_mirror.scrollTo(element.scrollLeft, element.scrollTop);
        //     refresh_mirror(element)
        // }
    });

    element.addEventListener('keyup', function(event) {
        scrollMirror(element)
    })
    
    element.addEventListener('scroll', function() {
        scrollMirror(element)
    })

    function scrollMirror(element) {
        let name = element.getAttribute('name')
        let id_mirror = element.dataset['mirror_id'];
        let mi_mirror = document.getElementById(id_mirror)
        if(mi_mirror)
            mi_mirror.scrollTo(element.scrollLeft, element.scrollTop);
    }
    
    function outputsize() {
        elements.forEach(function(element_for, index, array) {
            let name = element_for.getAttribute('name')
            let id_mirror = element.dataset['mirror_id'];
            let mi_mirror = document.getElementById(id_mirror)
            if(mi_mirror) {
                mi_mirror.style["width"] = element_for.offsetWidth + "px";
                mi_mirror.style["height"] = element_for.offsetHeight + "px";
                var isFocused = (document.activeElement === element);
                if(isFocused)
                    getCaretCoordinates(element, element.selectionStart, element.selectionEnd)
                    refresh_mirror(element)
            }
        })
    }
    
    new ResizeObserver(outputsize).observe(element)

}

window.addEventListener('resize', function(e) {
    document.querySelectorAll('[data-mirror_id]').forEach(function(element, index, array) {
        refresh_mirror(element)
    }); 
}, true);

document.addEventListener('scroll', function(e) {
    document.querySelectorAll('[data-mirror_id]').forEach(function(element, index, array) {
        refresh_mirror(element)
    }); 
}, true);


init()

observer.init({
    name: 'CoCreateCursor',
    observe: ['addedNodes'],
    target: '[collection][document_id][name]',
    callback: function(mutation) {
        initElement(mutation.target)
    }
});

const CoCreateCursors = { draw_cursor, refresh_mirror, recalculate_local_cursors };
export default CoCreateCursors;
