/*global Element*/
import observer from '@cocreate/observer'
import crud from '@cocreate/crud-client';
import uuid from '@cocreate/uuid';

import './CoCreate-cursors.css';

/**Uso esta variable para mostrar errores en caso que no este en prod*/

var element_multicursors = document.querySelectorAll('input,textarea,[contenteditable]')

//console.log(element_multicursors)
var debug = false
var enviroment_prod = true
var properties = ['boxSizing','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft','fontStyle','fontVariant','fontWeight','fontStretch','fontSize','lineHeight','fontFamily','textAlign','textTransform','textIndent','textDecoration','letterSpacing','wordSpacing','textRendering','webkitWritingMode','textTransform','textIndent','overflowWrap'];


class CocreateUtilsCursor{
  
  static print(message,debug) {
    debug = debug || false;
    if(debug)
      console.log(message)
  }
  
  
}

var getParents = function (elem, selector) {

// 	if (!Element.prototype.matches) {
// 		Element.prototype.matches =
// 			Element.prototype.matchesSelector ||
// 			Element.prototype.mozMatchesSelector ||
// 			Element.prototype.msMatchesSelector ||
// 			Element.prototype.oMatchesSelector ||
// 			Element.prototype.webkitMatchesSelector ||
// 			function(s) {
// 				var matches = (this.document || this.ownerDocument).querySelectorAll(s),
// 					i = matches.length;
// 				while (--i >= 0 && matches.item(i) !== this) {}
// 				return i > -1;
// 			};
// 	}
}

var mirrorDiv, computed, style, computedParentElement;

var getCaretCoordinates = function (element, position_start, position_end) {
  // mirrored div
  let name = element.getAttribute('name')
  let document_id = element.getAttribute('document_id') || '';
  if(document_id == ''){
    return false;
  }
  var ID_MIRROR = element.dataset['mirror_id']; //document_id + name +  '--mirror-div';
  mirrorDiv = document.getElementById(ID_MIRROR);
  var add_class_scroll = (element.className.indexOf('floating-label') == -1) ? false : true;

  if (!mirrorDiv) {
    mirrorDiv = document.createElement('div');
    mirrorDiv.id = ID_MIRROR;//document_id +name+ '--mirror-div';
      mirrorDiv.className = (enviroment_prod) ? 'mirror_color mirror_scroll mirror-width-scroll' : 'mirror-width-scroll';
    //document.body.appendChild(mirrorDiv);
    element.insertAdjacentElement('afterend',mirrorDiv);
  }

  var scrollwidth = element.offsetWidth - element.scrollWidth;

  style = mirrorDiv.style;
  computed = getComputedStyle(element);
  computedParentElement = getComputedStyle(element.parentElement);
  let margin_top = parseInt(computed['marginTop'])
  let margin_left = parseInt(computed['marginLeft'])

  if (element.nodeName !== 'INPUT'){
    style.wordWrap = 'break-word';  // only for textarea-s
    style.whiteSpace = 'pre-wrap';
  }else{
    style.whiteSpace = 'pre';
  }
  // position off-screen
  style.position = 'absolute';  // required to return coordinates properly
  
  var rect = element.getBoundingClientRect(); // get Position from element
  
  
  let scrrollTop_browser = document.documentElement.scrollTop
  
  //style.top = ((rect.top+scrrollTop_browser)-1) - (parseInt(computed['marginTop']) - parseInt(computed['borderTopWidth']) ) + 'px'//parseInt(computed.borderTopWidth) + 'px'; //  element.offsetTop + parseInt(computed.borderTopWidth) + 'px';
  //style.top = computedParentElement['top'];
  style.top = element.offsetTop+'px';
  //style.left = rect.left - (parseInt(computed['marginLeft']) -  parseInt(computed['borderLeftWidth']) ) + 'px'//parseInt(computed.borderLeftWidth) + 'px'   // margin_left+"px";//"400px";
  //style.left =  computedParentElement['left'];
  style.left = element.offsetLeft+'px';
  style.width = rect.width+'px';// - (parseInt(computed.borderLeftWidth) + parseInt(computed.borderRightWidth)) + 'px'   // margin_left+"px";//"400px";
  style.height = rect.height+'px';// - (parseInt(computed.borderTopWidth) + parseInt(computed.borderBottomWidth)) + 'px'   // margin_left+"px";//"400px";
  style.visibility ='visible'
  properties.forEach(function (prop) {
    if(['left','top'].indexOf(prop.toLowerCase()) === -1)
    style[prop] = computed[prop];
  });
  
  style.overflowX ='auto';
  style.overflowY ='hidden';
  style.margin = '0px'
  //style.padding = '0px'
  style.border = computed['border'];
  style.borderColor = 'transparent';
  /* 
  if(element.nodeName.toLowerCase()=='input'){
    style.overflowX ='auto';
    style.overflowY ='hidden';
  }else{
    style.overflow="visible"
  }*/
  
  // style.paddingRight = (parseInt(style.paddingRight) + scrollwidth - parseInt(computed.borderRightWidth)) +'px';
  let cursor_container = mirrorDiv.querySelectorAll('.cursor-container');
  let selectors_by_users = mirrorDiv.querySelectorAll('.selectors_by_users');
  let value_element = (['TEXTAREA','INPUT'].indexOf(element.nodeName)==-1) ?element.innerHTML :element.value;

  mirrorDiv.textContent = value_element.substring(0, position_start);
  if (element.nodeName === 'INPUT')
    mirrorDiv.textContent = mirrorDiv.textContent.replace(/\s/g, "\u00a0");
  var span = document.createElement('span');
  span.id = element.nodeName + 'span_selections';
  let value_span = value_element.substring(position_start,position_end) || ''
  span.textContent = value_span;  // || because a completely empty faux span doesn't render at all
  //span.style.backgroundColor = "lightgrey";
  mirrorDiv.appendChild(span);
  
  if(cursor_container){
      cursor_container.forEach(function (child_cursor, index, array) {
        mirrorDiv.appendChild(child_cursor);
    })
  }
  
  if(selectors_by_users){
    selectors_by_users.forEach(function (child_selection, index, array) {
        mirrorDiv.appendChild(child_selection);
    })
  }
  
  let value_end = value_element.substring(position_end)  || '';
  var span_end = document.createElement('span');
  mirrorDiv.appendChild(span_end);
  span_end.textContent = value_end;
  var rect = element.getBoundingClientRect(); // get Position from element
  var coordinates = {
    start : {
        top: span.offsetTop,
        left:  span.offsetLeft
    },
    end : {
        top: span_end.offsetTop, //+ parseInt(computed['borderTopWidth']),
        left:  span_end.offsetLeft // + parseInt(computed['borderLeftWidth'])
    }
  };

  return coordinates;
}

function getStyle(el,styleProp)
{
    if (window.getComputedStyle)
        var y = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
    return y;
}


function getDocument(collection,module_id){
  crud.readDocument({
    'collection': collection,
    'document_id': module_id
  })
}

crud.listen('readDocument', function(data) {
    let cursor = document.querySelector('.cursor-flag[document_id="'+data['document_id']+'"]')
    if (cursor)
      cursor.innerHTML = data.result[cursor.getAttribute('name')]
})


function draw_cursor(json){
        CocreateUtilsCursor.print(["draw Cursor ",json],debug)
        let element = json['element'];
        let activate_cursor = (element.dataset['cursors'])?element.dataset['mirror_id']:true;
        if(activate_cursor){
          let start = json['startPosition']
          let end = json['endPositon']
          let socket_id = json['clientId']
          let document_id = element.getAttribute('document_id') || '';
          if(document_id!=''){
            CocreateUtilsCursor.print("action document_id " + document_id,debug)
            if( typeof element.dataset['mirror_id'] == 'undefined' || element.dataset['mirror_id'] == '')
                element.dataset['mirror_id'] = uuid.generate(30)
            let coordinates = getCaretCoordinates(element,start,end);
            if(!coordinates)
              return false;
            let name = element.getAttribute('name')
            let id_mirror = element.dataset['mirror_id']; //document_id+name+'--mirror-div'
            let mi_mirror = document.getElementById(id_mirror)
            let cursor = false;
            let selection_user = false;
            let identify = '_'+id_mirror;
            let user = (typeof(json) != 'undefined' && json.hasOwnProperty('user')) ? json.user : false
            let user_id = (typeof(json) != 'undefined' && json.hasOwnProperty('user_id') ) ?  user.user_id : false
            if (socket_id){
               //if(data && data.hasOwnProperty('id_mirror')){
                 var cursores_other_elements = document.querySelectorAll('#socket_'+socket_id+identify)
                 cursores_other_elements.forEach(function(child_cursor, index, array){
                   if(child_cursor.parentElement.getAttribute('id') != id_mirror){
                     CocreateUtilsCursor.print("remove old cursor others elements",debug)
                      child_cursor.remove()
                   }
                 })
               //}
                 cursor = mi_mirror.querySelector('.cursor-container#socket_'+socket_id+identify);
                 if(!cursor  && json.hasOwnProperty('user')){
                    if(user){
                      CocreateUtilsCursor.print("Create Cursor",debug)
                      let cursor_template = '<div style="color:blue;" class="cursor-container" \
                                                  id="socket_'+socket_id+identify+'" \
                                                  ><div class="cursor" \
                                                  style="background-color:'+user.color+'"></div>\
                                                  <div class="cursor-flag" collection="users" \
                                                  name="name" \
                                                  user-name="'+user.name+'" \
                                                  user-color="'+user.color+'" \
                                                  data-socket_id="'+socket_id+'" \
                                                  data-id_mirror="'+id_mirror+'" \
                                                  document_id="'+user_id+'" \
                                                  style="background-color:'+user.color+'" \
                                                  flag>'+user.name+'</div></div>';
                      mi_mirror.innerHTML = cursor_template + mi_mirror.innerHTML;
                      
                    }
                    if(user_id){
                     // si tiene user_id actualiza el nombre del cursor usando crud
                      crud.readDocument({
                        'collection' : 'users', 
                        'document_id': user_id
                      })
                   }
                 }
              cursor = mi_mirror.querySelector('.cursor-container#socket_'+socket_id+identify);
            }
            if(cursor){
              CocreateUtilsCursor.print(["Update Cursor",cursor,coordinates],debug)
              let font_size = getStyle(element,'font-size')
              font_size = parseFloat(font_size.substring(0,font_size.length-2));
              let cursor_height = ( (font_size * 112.5) / 100)
              let my_cursor = cursor.querySelector('.cursor')
              cursor.dataset.start = start
              cursor.dataset.end = end
              cursor.dataset.socket_id = socket_id
              /*cursor.dataset.user_name = user.name
              cursor.dataset.user_color = user.color*/
  
              cursor.style["top"] = coordinates.end.top+"px"; 
              
              cursor.style["width"] = "2px";  //2px
              my_cursor.style["height"] = cursor_height+"px"; 
              cursor.style["left"] = coordinates.end.left+"px"; 
              
              //add selections
                selection_user = document.getElementById('sel-'+socket_id+identify);
                if((start != end) && user ){
                      selection_user = document.getElementById('sel-'+socket_id+identify)
                      if(selection_user){
                        selection_user.remove()
                      }
                        var scrollwidth = element.offsetWidth - element.scrollWidth;
                        var padding_right = parseInt(getComputedStyle(element)["paddingRight"])
                        selection_user = document.createElement('span');
                        selection_user.id = 'sel-'+socket_id+identify;
                        selection_user.className='selectors_by_users'
                        let style_mirror = getComputedStyle(mi_mirror)
                        selection_user.style["position"] = "absolute"; 
                        selection_user.style["top"] = style_mirror.paddingTop; 
                        selection_user.style["left"] = style_mirror.paddingLeft; 
                        selection_user.style["padding-right"] = scrollwidth+padding_right+"px"; 
                        mi_mirror.insertBefore(selection_user, mi_mirror.firstChild);
                      let selection_span_by_user = document.createElement('span');
                      selection_span_by_user.id = 'selection-'+socket_id+identify;
                      selection_span_by_user.style.backgroundColor = user.color;
                      let value_element = (['TEXTAREA','INPUT'].indexOf(element.nodeName)==-1) ?element.innerHTML :element.value;
                      selection_user.textContent = value_element.substring(0, start);
                      let value_span_selection = value_element.substring(start,end) || ''
                      console.log("Selection ",value_span_selection,start,end)
                      //selection_span_by_user.style.opacity = 0.5;
                      selection_span_by_user.textContent = value_span_selection;
                      selection_user.appendChild(selection_span_by_user)
                }//end Selections
                else{
                  if(selection_user){
                    selection_user.remove()
                  }
                }
            }
          }//end if document_id
        }//end activate_cursors
}//draw_cursor

function refresh_mirror(element){
  var id_mirror = ''
  let document_id = element.getAttribute('document_id') || '';
  if(document_id!=''){
    name = element.getAttribute('name')
    if(element.dataset['mirror_id'])
      id_mirror = element.dataset['mirror_id']
      else 
      return;
    //console.log("Refresh ",id_mirror)
    var mi_mirror = document.getElementById(id_mirror)
    CocreateUtilsCursor.print(["refresh_mirror ",mi_mirror],debug)
    var selector_element = element.nodeName+"[name='"+name+"'][document_id='"+document_id+"']"
    CocreateUtilsCursor.print(["selector -> "+selector_element],debug)
    
      if(mi_mirror){
        computed = getComputedStyle(element);
        style = mi_mirror.style
        style.width = element.offsetWidth - (parseInt(computed.borderLeftWidth) + parseInt(computed.borderRightWidth)) + 'px'
        style.height = element.offsetHeight - (parseInt(computed.borderTopWidth) + parseInt(computed.borderBottomWidth)) + 'px'
        var cursor_container = mi_mirror.querySelectorAll('.cursor-container');
        cursor_container.forEach(function (child_cursor, index, array) {
          //console.log("REdraw cursor")
        let child = child_cursor.querySelector('.cursor-flag');
        let dataset_child = child.dataset;
        let dataset = child_cursor.dataset;
          draw_cursor({
                            element:element,
                            startPosition:dataset.start,
                            endPositon:dataset.end,
                            clientId : dataset.socket_id,
                            user:{
                                'color':dataset_child.user_color,
                                'name':dataset.user_name
                                },
                        });
        })
      }
  }//end document
}//end verify 

Element.prototype.remove = function() {
  if (this.parentElement) {
    this.parentElement.removeChild(this);
  }
}

function recalculate_local_cursors(element,count){
          CocreateUtilsCursor.print("count "+count,debug)
          let my_start = ( ! element.hasAttribute('contenteditable'))  ? element.selectionStart : parseInt(element.getAttribute("selection_start"));
          //let my_start   = element.selectionStart
          let name = element.getAttribute('name') || '';
          let document_id = element.getAttribute('document_id') || '';
          let collection = element.getAttribute('collection') || '';
          let selector = '[collection="'+collection+'"][document_id="'+document_id+'"][name="'+name+'"]'
          let id_mirror = element.dataset['mirror_id']; //let id_mirror = document_id+name+'--mirror-div';
          let mirrorDiv = document.getElementById(id_mirror);
          let cursor_container = (mirrorDiv) ? mirrorDiv.querySelectorAll('.cursor-container') : null;
          if(cursor_container){
              let containers_cursors = [];
              cursor_container.forEach(function (child_cursor, index, array) {
                  let start = parseInt(child_cursor.getAttribute('data-start'));
                  let user_name = child_cursor.getAttribute('user-name');
                    CocreateUtilsCursor.print(["my_start local",my_start,'start cursor '+user_name+" = ",start],debug)
                  if(start > my_start && containers_cursors.indexOf(user_name) == -1 ){
                    CocreateUtilsCursor.print("Es mayor",debug)
                    let end = parseInt(child_cursor.getAttribute('data-end'));
                    let pos_start = start+count;
                    let pos_end = end+count;
                    CocreateUtilsCursor.print(['pos_start',pos_start,'pos_end',pos_end],debug)
                    let dataset = child_cursor.querySelector('.cursor-flag').dataset
                    let clientId = dataset.socket_id;
                    let json = {
                                element:element,
                                startPosition:pos_start,
                                endPositon:pos_end,
                                clientId:clientId,
                                'user':{
                                    'color':dataset.user_color,
                                    'name':dataset.user_name
                                    },
                            }
                    CocreateUtilsCursor.print(["sent Draw Cursor ",json],debug)
                    draw_cursor(json);
                    containers_cursors.push(user_name);
                  }
                  
                //mirrorDiv.appendChild(child_cursor);
            })
          }
}

function initCursorEl(element){
  let formulario = getParents(element,'form')
          let realtime = element.hasAttribute('realtime') ? element.getAttribute('realtime') : 'true';
          if( realtime =='true' ||  (formulario && formulario.getAttribute('realtime') =='true' ) ){
            if(realtime =='false')
                      return false;
                  CocreateUtilsCursor.print(["Init Events ",element],debug)
                  /*
                  element.addEventListener('input',function(event){
                      let start = element.selectionStart;
                      let end = element.selectionEnd;
                      let coordinates = getCaretCoordinates(element,start,end);
                      let count = 0;
                      switch(event.inputType){
                        case 'insertText':
                          count = 1;
                        break;
                        case 'insertFromPaste':
                         // count = event.clipboardData.getData('Text').length
                        break;
                        case 'deleteContentBackward':
                        //case 'insertFromPaste':
                          count = -1;
                        break;
                      }
                      if(count)
                        recalculate_local_cursors(this,count)
                  },false)
                  */
                    element.addEventListener('scroll',function(){
                      CocreateUtilsCursor.print(["Move Scroll ",element],true)
                      let name = element.getAttribute('name')
                      let document_id = element.getAttribute('document_id') || '';
                      let id_mirror = element.dataset['mirror_id'];
                      let mi_mirror = document.getElementById(id_mirror)
                      if(mi_mirror){
                        mi_mirror.scrollTo(element.scrollLeft,element.scrollTop);
                      }
                    },false)
                    
                    //resize
                    function outputsize() {
                      element_multicursors.forEach(function (element_for, index, array) {
                              let name = element_for.getAttribute('name')
                              let id_mirror = element.dataset['mirror_id']; 
                              CocreateUtilsCursor.print(["Resize id_mirror -> "+id_mirror],debug)
                              let mi_mirror = document.getElementById(id_mirror)
                              if(mi_mirror){
                                mi_mirror.style["width"] = element_for.offsetWidth+"px";
                                mi_mirror.style["height"] = element_for.offsetHeight+"px";
                                //var isFocused = (document.activeElement === element_for);
                                //verify_cursor(element_for,isFocused)
                                var isFocused = (document.activeElement === element);
                                if(isFocused)
                                  getCaretCoordinates(element,element.selectionStart,element.selectionEnd)
                                refresh_mirror(element)
                              }
                        })
                    }
                    new ResizeObserver(outputsize).observe(element)
                  //if (element.nodeName == 'INPUT'){
                    element.addEventListener('mousemove',function(event){
                        let name = element.getAttribute('name')
                        let document_id = element.getAttribute('document_id')
                        let id_mirror = element.dataset['mirror_id'];
                        let mi_mirror = document.getElementById(id_mirror)
                        if(mi_mirror)
                          mi_mirror.scrollTo(element.scrollLeft,element.scrollTop);
                    });
                    
                    element.addEventListener('focusout',function(event){
                        let name = element.getAttribute('name')
                        let document_id = element.getAttribute('document_id') || '';
                        let id_mirror = element.dataset['mirror_id'];
                        let mi_mirror = document.getElementById(id_mirror)
                        if(mi_mirror)
                          mi_mirror.scrollTo(element.scrollLeft,element.scrollTop);
                    })
                    
                    element.addEventListener('keydown',function(event){
                      //console.log("keydown L,T => ",element.scrollLeft,element.scrollTop)
                         let name = element.getAttribute('name')
                         let id_mirror = element.dataset['mirror_id'];
                          let mi_mirror = document.getElementById(id_mirror)
                          if(mi_mirror){
                            mi_mirror.scrollTo(element.scrollLeft,element.scrollTop);  
                            refresh_mirror(element)
                          }
                    });
                    
                    
                    element.addEventListener('keyup',function(event){
                      //console.log("keyup L,T => ",element.scrollLeft,element.scrollTop)
                       let name = element.getAttribute('name')
                       let id_mirror = element.dataset['mirror_id'];
                        let mi_mirror = document.getElementById(id_mirror)
                        if(mi_mirror)
                          mi_mirror.scrollTo(element.scrollLeft,element.scrollTop);
                    })
                    
                  //}
          }//end if realtime TRUE
}

var initialize_multicursor = function(element_multicursors){
      element_multicursors.forEach(function (element, index, array) {
          initCursorEl(element);
      }); // element_multicursors.forEach
}//end initialize_multicursor 


window.addEventListener('resize', function(e){ 
  //console.log("resize windows")
  document.querySelectorAll('[data-mirror_id]').forEach(function (element, index, array) {
          refresh_mirror(element)
  }); // element_multicursors.forEach
}, true);
document.addEventListener('scroll', function(e){ 
  //console.log("Scroll ")
  //console.log("scroll windows",document.body.scrollLeft,document.body.scrollTop)
  //element_multicursors.forEach(function (element, index, array) {
  document.querySelectorAll('[data-mirror_id]').forEach(function (element, index, array) {
          refresh_mirror(element)
  }); // element_multicursors.forEach
  
  
}, true);

function initCursorElements(container) {
  let mainContainer = container || window;
  
  if (!mainContainer.querySelectorAll) {
    return;
  }
  
  let elements = mainContainer.querySelectorAll('[realtime=true]');
  
  elements.forEach(el => {
    initCursorEl(el);
  })
}

if(debug)
  console.log("elements to INIT -> ",element_multicursors)
initialize_multicursor(element_multicursors);

// CoCreateInit.register_old('[realtime=true]',initCursorEl);
// CoCreateInit.register('CoCreateCursor', window, initCursorElements);

observer.init({ 
	name: 'CoCreateCursor', 
	observe: ['addedNodes'],
	target: '[collection][document_id][name]',
	callback: function(mutation) {
	  let el = mutation.target;
	  el.hasAttribute('collection') &&
	  el.hasAttribute('document_id') &&
	  el.hasAttribute('name') &&
	  el.getAttribute('realtime') == 'true' &&
		initCursorElements(mutation.target)
	}
});

const CoCreateCursors = { draw_cursor, refresh_mirror, recalculate_local_cursors };
export default CoCreateCursors;