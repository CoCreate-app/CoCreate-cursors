/*! For license information please see selected-chunk.js.LICENSE.txt */
(this.webpackChunkCoCreate_cursors=this.webpackChunkCoCreate_cursors||[]).push([["selected-chunk"],{"../CoCreate-selected/src/index.js":(__unused_webpack_module,exports)=>{"use strict";eval("\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: true\n}));\nexports.default = void 0;\nconst CoCreateSelected = {\n  // init: function() {\n  // \tthis.initElement(document);\n  // },\n  // initElement: function(container) {\n  // \tlet mainContainer = container || document;\n  // \tif (!mainContainer.querySelectorAll) {\n  // \t\treturn;\n  // \t}\n  // \tlet elements = mainContainer.querySelectorAll(`[data-selected]`);\n  // \tif (elements.length === 0 && mainContainer != document && mainContainer.hasAttribute(`[data-selected]`)) {\n  // \t\telements = [mainContainer];\n  // \t}\n  // \tconst self = this;\n  // \telements.forEach((element) => self.__initElementEvent(element));\n  // },\n  // __initElementEvent: function(element) {\n  // \tconst selectedValue = element.getAttribute('data-selected') || \"\";\n  // \tlet values = selectedValue.split(',');\n  // \tif (!values || values.length === 0) {\n  // \t\treturn;\n  // \t}\n  // \tvalues = values.map(x => x.trim())\n  // \tconst self = this;\n  // \t// if (CoCreate.observer.getInitialized(element)) {\n  // \t// \treturn;\n  // \t// }\n  // \t// CoCreate.observer.setInitialized(element)\n  // \telement['co_initialized_'] = true;\n  // \telement.addEventListener('click', function() {\n  // \t\tself.__changeElementStatus(element, values)\n  // \t});\n  // \tdocument.addEventListener('click', function(event) {\n  // \t\tif (!element.hasAttribute(\"data-selected_group\") && !element.contains(event.target)) {\n  // \t\t\tself.__removeSelectedStatus(element, values);\n  // \t\t}\n  // \t})\n  // },\n  // __changeElementStatus: function(element, values) {\n  // \tlet target_attribute = element.dataset[`selected_attribute`] || 'class';\n  // \tlet elements = this.__getTargetElements(element);\n  // \tconst self = this;\n  // \tlet selectedGroup = element.dataset['selected_group'];\n  // \tlet group = selectedGroup ? `[data-selected_group=\"${selectedGroup}\"]` : ':not([data-selected_group])';\n  // \tlet previouSelected = document.querySelector('[data-selected]' + group + '[selected]');\n  // \t// if (previouSelected.isSameNode(element)) {\n  // \t// \treturn ;\n  // \t// }\n  // \tif (previouSelected) {\n  // \t\tlet previousValues = previouSelected.dataset['selected'].split(',').map(x => x.trim());\n  // \t\tthis.__removeSelectedStatus(previouSelected, previousValues)\n  // \t}\n  // \tvalues = values.map(x => x.trim());\n  // \telements.forEach((el) => {\n  // \t\tself.setValue(el, target_attribute, values);\n  // \t})\n  // },\n  // __removeSelectedStatus: function(element, values) {\n  // \tlet attrName = element.dataset[`selected_attribute`] || 'class';\n  // \tlet elements = this.__getTargetElements(element);\n  // \telements.forEach(el => {\n  // \t\tif (attrName === 'class') {\n  // \t\t\tlet attrValues = (el.getAttribute(attrName) || \"\").split(' ').map(x => x.trim());\n  // \t\t\tlet currentValue = values.filter(x => attrValues.includes(x))[0] || '';\n  // \t\t\tif (currentValue) {\n  // \t\t\t\tel.classList.remove(currentValue);\n  // \t\t\t}\n  // \t\t}\n  // \t\telse {\n  // \t\t\tel.setAttribute(attrName, \"\");\n  // \t\t}\n  // \t\tel.removeAttribute('selected');\n  // \t})\n  // },\n  // setValue: function(element, attrName, values) {\n  // \tlet currentAttrValue = element.getAttribute(attrName) || \"\";\n  // \tlet attrValues = currentAttrValue;\n  // \tif (attrName === 'class') {\n  // \t\tattrValues = currentAttrValue.split(' ').map(x => x.trim());\n  // \t}\n  // \tlet oldValue = values.filter(x => attrValues.includes(x))[0] || '';\n  // \tlet newValue = this.__getNextValue(values, oldValue)\n  // \telement.setAttribute('selected', \"\")\n  // \tif (oldValue === newValue) {\n  // \t\treturn;\n  // \t}\n  // \tif (attrName === 'class') {\n  // \t\tif (oldValue != '') {\n  // \t\t\telement.classList.remove(oldValue);\n  // \t\t}\n  // \t\tif (newValue != '') {\n  // \t\t\telement.classList.add(newValue);\n  // \t\t}\n  // \t}\n  // \telse {\n  // \t\telement.setAttribute(attrName, newValue);\n  // \t}\n  // },\n  // __getTargetElements: function(element) {\n  // \tlet targetSelector = element.dataset[`selected_target`];\n  // \tlet elements = [element];\n  // \tif (targetSelector) {\n  // \t\telements = Array.from(document.querySelectorAll(targetSelector));\n  // \t\telements.push(element)\n  // \t}\n  // \treturn elements;\n  // },\n  // __getNextValue: function(values, val) {\n  // \tlet size = values.length;\n  // \tlet nn = values.indexOf(val);\n  // \tif (nn == -1) {\n  // \t\treturn values[0];\n  // \t}\n  // \telse {\n  // \t\treturn values[(nn + 1) % size];\n  // \t}\n  // },\n  config: function ({\n    srcDocument,\n    destDocument,\n    wrap,\n    callback = () => '',\n    selector,\n    target,\n    srcAttribute,\n    destAttribute,\n    type = \"post\",\n    eventType = \"click\"\n  }) {\n    srcDocument.addEventListener(eventType, e => {\n      if (e.target.matches(selector) || srcAttribute && e.target.hasAttribute(srcAttribute)) {\n        let targets = destDocument.querySelectorAll(target);\n        targets.forEach(target => {\n          let value = e.target.getAttribute(srcAttribute);\n          if (wrap) value = wrap.replace(\"$1\", value);\n          if (destAttribute) target.setAttribute(destAttribute, value);\n          callback(e.target, target);\n        });\n      }\n\n      if (type === \"cut\") e.target.removeAttribute(srcAttribute);\n    });\n  },\n  selected: function selected() {\n    function activate(ds, el) {\n      if (ds[\"selected_attribute\"]) el.setAttribute(ds[\"selected_attribute\"], ds[\"selected\"]);else {\n        el.classList.add(ds[\"selected\"]);\n        el.setAttribute('selected', '');\n      }\n    }\n\n    function deactiave(ds, el) {\n      if (ds[\"selected_attribute\"]) el.removeAttribute(ds[\"selected_attribute\"], ds[\"selected\"]);else {\n        el.classList.remove(ds[\"selected\"]);\n        el.removeAttribute('selected', '');\n      }\n    }\n\n    function getSelected(el) {\n      while (!el.dataset['selected']) if (el.parentElement) el = el.parentElement;else return false;\n\n      return el;\n    }\n\n    document.addEventListener(\"click\", e => {\n      let el = getSelected(e.target);\n      if (!el) return;\n      let ds = el.dataset;\n      let group = ds['selected_group'] ? `,[data-selected_group=\"${ds[\"selected_group\"] || 'null'}\"]` : '';\n      document.querySelectorAll(` [data-selected]:not([data-selected_group])${group}`).forEach(el => {\n        let ds = el.dataset;\n        deactiave(el.dataset, el);\n        if (ds[\"selected_target\"]) document.querySelectorAll(ds[\"selected_target\"]).forEach(el => deactiave(ds, el));\n      });\n      activate(ds, el);\n      if (ds[\"selected_target\"]) document.querySelectorAll(ds[\"selected_target\"]).forEach(el => activate(ds, el));\n    });\n  }\n};\nCoCreateSelected.selected();\nvar _default = CoCreateSelected;\nexports.default = _default;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Db0NyZWF0ZS5jdXJzb3JzLy4uL0NvQ3JlYXRlLXNlbGVjdGVkL3NyYy9pbmRleC5qcz9jYWNiIl0sIm5hbWVzIjpbIkNvQ3JlYXRlU2VsZWN0ZWQiLCJjb25maWciLCJzcmNEb2N1bWVudCIsImRlc3REb2N1bWVudCIsIndyYXAiLCJjYWxsYmFjayIsInNlbGVjdG9yIiwidGFyZ2V0Iiwic3JjQXR0cmlidXRlIiwiZGVzdEF0dHJpYnV0ZSIsInR5cGUiLCJldmVudFR5cGUiLCJhZGRFdmVudExpc3RlbmVyIiwiZSIsIm1hdGNoZXMiLCJoYXNBdHRyaWJ1dGUiLCJ0YXJnZXRzIiwicXVlcnlTZWxlY3RvckFsbCIsImZvckVhY2giLCJ2YWx1ZSIsImdldEF0dHJpYnV0ZSIsInJlcGxhY2UiLCJzZXRBdHRyaWJ1dGUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJzZWxlY3RlZCIsImFjdGl2YXRlIiwiZHMiLCJlbCIsImNsYXNzTGlzdCIsImFkZCIsImRlYWN0aWF2ZSIsInJlbW92ZSIsImdldFNlbGVjdGVkIiwiZGF0YXNldCIsInBhcmVudEVsZW1lbnQiLCJkb2N1bWVudCIsImdyb3VwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxNQUFNQSxnQkFBZ0IsR0FBRztBQUd4QjtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QWlCQTtBQTVOdUIsQ0FBekI7QUFrT0EzQixnQkFBZ0IsQ0FBQ3dCLFFBQWpCO2VBRWV4QixnQiIsImZpbGUiOiIuLi9Db0NyZWF0ZS1zZWxlY3RlZC9zcmMvaW5kZXguanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBDb0NyZWF0ZVNlbGVjdGVkID0ge1xuXG5cblx0Ly8gaW5pdDogZnVuY3Rpb24oKSB7XG5cdC8vIFx0dGhpcy5pbml0RWxlbWVudChkb2N1bWVudCk7XG5cdC8vIH0sXG5cblx0Ly8gaW5pdEVsZW1lbnQ6IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuXHQvLyBcdGxldCBtYWluQ29udGFpbmVyID0gY29udGFpbmVyIHx8IGRvY3VtZW50O1xuXG5cdC8vIFx0aWYgKCFtYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwpIHtcblx0Ly8gXHRcdHJldHVybjtcblx0Ly8gXHR9XG5cblx0Ly8gXHRsZXQgZWxlbWVudHMgPSBtYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoYFtkYXRhLXNlbGVjdGVkXWApO1xuXHQvLyBcdGlmIChlbGVtZW50cy5sZW5ndGggPT09IDAgJiYgbWFpbkNvbnRhaW5lciAhPSBkb2N1bWVudCAmJiBtYWluQ29udGFpbmVyLmhhc0F0dHJpYnV0ZShgW2RhdGEtc2VsZWN0ZWRdYCkpIHtcblx0Ly8gXHRcdGVsZW1lbnRzID0gW21haW5Db250YWluZXJdO1xuXHQvLyBcdH1cblx0Ly8gXHRjb25zdCBzZWxmID0gdGhpcztcblx0Ly8gXHRlbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PiBzZWxmLl9faW5pdEVsZW1lbnRFdmVudChlbGVtZW50KSk7XG5cdC8vIH0sXG5cblx0Ly8gX19pbml0RWxlbWVudEV2ZW50OiBmdW5jdGlvbihlbGVtZW50KSB7XG5cdC8vIFx0Y29uc3Qgc2VsZWN0ZWRWYWx1ZSA9IGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLXNlbGVjdGVkJykgfHwgXCJcIjtcblx0Ly8gXHRsZXQgdmFsdWVzID0gc2VsZWN0ZWRWYWx1ZS5zcGxpdCgnLCcpO1xuXHQvLyBcdGlmICghdmFsdWVzIHx8IHZhbHVlcy5sZW5ndGggPT09IDApIHtcblx0Ly8gXHRcdHJldHVybjtcblx0Ly8gXHR9XG5cdC8vIFx0dmFsdWVzID0gdmFsdWVzLm1hcCh4ID0+IHgudHJpbSgpKVxuXG5cdC8vIFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0Ly8gXHQvLyBpZiAoQ29DcmVhdGUub2JzZXJ2ZXIuZ2V0SW5pdGlhbGl6ZWQoZWxlbWVudCkpIHtcblx0Ly8gXHQvLyBcdHJldHVybjtcblx0Ly8gXHQvLyB9XG5cdC8vIFx0Ly8gQ29DcmVhdGUub2JzZXJ2ZXIuc2V0SW5pdGlhbGl6ZWQoZWxlbWVudClcblx0Ly8gXHRlbGVtZW50Wydjb19pbml0aWFsaXplZF8nXSA9IHRydWU7XG5cblx0Ly8gXHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdC8vIFx0XHRzZWxmLl9fY2hhbmdlRWxlbWVudFN0YXR1cyhlbGVtZW50LCB2YWx1ZXMpXG5cdC8vIFx0fSk7XG5cblx0Ly8gXHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdC8vIFx0XHRpZiAoIWVsZW1lbnQuaGFzQXR0cmlidXRlKFwiZGF0YS1zZWxlY3RlZF9ncm91cFwiKSAmJiAhZWxlbWVudC5jb250YWlucyhldmVudC50YXJnZXQpKSB7XG5cblx0Ly8gXHRcdFx0c2VsZi5fX3JlbW92ZVNlbGVjdGVkU3RhdHVzKGVsZW1lbnQsIHZhbHVlcyk7XG5cdC8vIFx0XHR9XG5cdC8vIFx0fSlcblx0Ly8gfSxcblxuXHQvLyBfX2NoYW5nZUVsZW1lbnRTdGF0dXM6IGZ1bmN0aW9uKGVsZW1lbnQsIHZhbHVlcykge1xuXHQvLyBcdGxldCB0YXJnZXRfYXR0cmlidXRlID0gZWxlbWVudC5kYXRhc2V0W2BzZWxlY3RlZF9hdHRyaWJ1dGVgXSB8fCAnY2xhc3MnO1xuXHQvLyBcdGxldCBlbGVtZW50cyA9IHRoaXMuX19nZXRUYXJnZXRFbGVtZW50cyhlbGVtZW50KTtcblx0Ly8gXHRjb25zdCBzZWxmID0gdGhpcztcblxuXHQvLyBcdGxldCBzZWxlY3RlZEdyb3VwID0gZWxlbWVudC5kYXRhc2V0WydzZWxlY3RlZF9ncm91cCddO1xuXHQvLyBcdGxldCBncm91cCA9IHNlbGVjdGVkR3JvdXAgPyBgW2RhdGEtc2VsZWN0ZWRfZ3JvdXA9XCIke3NlbGVjdGVkR3JvdXB9XCJdYCA6ICc6bm90KFtkYXRhLXNlbGVjdGVkX2dyb3VwXSknO1xuXG5cdC8vIFx0bGV0IHByZXZpb3VTZWxlY3RlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXNlbGVjdGVkXScgKyBncm91cCArICdbc2VsZWN0ZWRdJyk7XG5cblx0Ly8gXHQvLyBpZiAocHJldmlvdVNlbGVjdGVkLmlzU2FtZU5vZGUoZWxlbWVudCkpIHtcblx0Ly8gXHQvLyBcdHJldHVybiA7XG5cdC8vIFx0Ly8gfVxuXG5cdC8vIFx0aWYgKHByZXZpb3VTZWxlY3RlZCkge1xuXHQvLyBcdFx0bGV0IHByZXZpb3VzVmFsdWVzID0gcHJldmlvdVNlbGVjdGVkLmRhdGFzZXRbJ3NlbGVjdGVkJ10uc3BsaXQoJywnKS5tYXAoeCA9PiB4LnRyaW0oKSk7XG5cdC8vIFx0XHR0aGlzLl9fcmVtb3ZlU2VsZWN0ZWRTdGF0dXMocHJldmlvdVNlbGVjdGVkLCBwcmV2aW91c1ZhbHVlcylcblx0Ly8gXHR9XG5cblx0Ly8gXHR2YWx1ZXMgPSB2YWx1ZXMubWFwKHggPT4geC50cmltKCkpO1xuXHQvLyBcdGVsZW1lbnRzLmZvckVhY2goKGVsKSA9PiB7XG5cdC8vIFx0XHRzZWxmLnNldFZhbHVlKGVsLCB0YXJnZXRfYXR0cmlidXRlLCB2YWx1ZXMpO1xuXHQvLyBcdH0pXG5cdC8vIH0sXG5cblx0Ly8gX19yZW1vdmVTZWxlY3RlZFN0YXR1czogZnVuY3Rpb24oZWxlbWVudCwgdmFsdWVzKSB7XG5cdC8vIFx0bGV0IGF0dHJOYW1lID0gZWxlbWVudC5kYXRhc2V0W2BzZWxlY3RlZF9hdHRyaWJ1dGVgXSB8fCAnY2xhc3MnO1xuXG5cdC8vIFx0bGV0IGVsZW1lbnRzID0gdGhpcy5fX2dldFRhcmdldEVsZW1lbnRzKGVsZW1lbnQpO1xuXG5cdC8vIFx0ZWxlbWVudHMuZm9yRWFjaChlbCA9PiB7XG5cdC8vIFx0XHRpZiAoYXR0ck5hbWUgPT09ICdjbGFzcycpIHtcblx0Ly8gXHRcdFx0bGV0IGF0dHJWYWx1ZXMgPSAoZWwuZ2V0QXR0cmlidXRlKGF0dHJOYW1lKSB8fCBcIlwiKS5zcGxpdCgnICcpLm1hcCh4ID0+IHgudHJpbSgpKTtcblx0Ly8gXHRcdFx0bGV0IGN1cnJlbnRWYWx1ZSA9IHZhbHVlcy5maWx0ZXIoeCA9PiBhdHRyVmFsdWVzLmluY2x1ZGVzKHgpKVswXSB8fCAnJztcblx0Ly8gXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSkge1xuXHQvLyBcdFx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoY3VycmVudFZhbHVlKTtcblx0Ly8gXHRcdFx0fVxuXHQvLyBcdFx0fVxuXHQvLyBcdFx0ZWxzZSB7XG5cdC8vIFx0XHRcdGVsLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgXCJcIik7XG5cdC8vIFx0XHR9XG5cdC8vIFx0XHRlbC5yZW1vdmVBdHRyaWJ1dGUoJ3NlbGVjdGVkJyk7XG5cdC8vIFx0fSlcblxuXHQvLyB9LFxuXG5cdC8vIHNldFZhbHVlOiBmdW5jdGlvbihlbGVtZW50LCBhdHRyTmFtZSwgdmFsdWVzKSB7XG5cdC8vIFx0bGV0IGN1cnJlbnRBdHRyVmFsdWUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyTmFtZSkgfHwgXCJcIjtcblx0Ly8gXHRsZXQgYXR0clZhbHVlcyA9IGN1cnJlbnRBdHRyVmFsdWU7XG5cdC8vIFx0aWYgKGF0dHJOYW1lID09PSAnY2xhc3MnKSB7XG5cdC8vIFx0XHRhdHRyVmFsdWVzID0gY3VycmVudEF0dHJWYWx1ZS5zcGxpdCgnICcpLm1hcCh4ID0+IHgudHJpbSgpKTtcblx0Ly8gXHR9XG5cblx0Ly8gXHRsZXQgb2xkVmFsdWUgPSB2YWx1ZXMuZmlsdGVyKHggPT4gYXR0clZhbHVlcy5pbmNsdWRlcyh4KSlbMF0gfHwgJyc7XG5cdC8vIFx0bGV0IG5ld1ZhbHVlID0gdGhpcy5fX2dldE5leHRWYWx1ZSh2YWx1ZXMsIG9sZFZhbHVlKVxuXG5cdC8vIFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3NlbGVjdGVkJywgXCJcIilcblxuXHQvLyBcdGlmIChvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHtcblx0Ly8gXHRcdHJldHVybjtcblx0Ly8gXHR9XG5cblx0Ly8gXHRpZiAoYXR0ck5hbWUgPT09ICdjbGFzcycpIHtcblx0Ly8gXHRcdGlmIChvbGRWYWx1ZSAhPSAnJykge1xuXHQvLyBcdFx0XHRlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUob2xkVmFsdWUpO1xuXHQvLyBcdFx0fVxuXHQvLyBcdFx0aWYgKG5ld1ZhbHVlICE9ICcnKSB7XG5cdC8vIFx0XHRcdGVsZW1lbnQuY2xhc3NMaXN0LmFkZChuZXdWYWx1ZSk7XG5cdC8vIFx0XHR9XG5cdC8vIFx0fVxuXHQvLyBcdGVsc2Uge1xuXHQvLyBcdFx0ZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIG5ld1ZhbHVlKTtcblx0Ly8gXHR9XG5cdC8vIH0sXG5cblx0Ly8gX19nZXRUYXJnZXRFbGVtZW50czogZnVuY3Rpb24oZWxlbWVudCkge1xuXHQvLyBcdGxldCB0YXJnZXRTZWxlY3RvciA9IGVsZW1lbnQuZGF0YXNldFtgc2VsZWN0ZWRfdGFyZ2V0YF07XG5cdC8vIFx0bGV0IGVsZW1lbnRzID0gW2VsZW1lbnRdO1xuXHQvLyBcdGlmICh0YXJnZXRTZWxlY3Rvcikge1xuXHQvLyBcdFx0ZWxlbWVudHMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGFyZ2V0U2VsZWN0b3IpKTtcblx0Ly8gXHRcdGVsZW1lbnRzLnB1c2goZWxlbWVudClcblx0Ly8gXHR9XG5cdC8vIFx0cmV0dXJuIGVsZW1lbnRzO1xuXHQvLyB9LFxuXG5cdC8vIF9fZ2V0TmV4dFZhbHVlOiBmdW5jdGlvbih2YWx1ZXMsIHZhbCkge1xuXHQvLyBcdGxldCBzaXplID0gdmFsdWVzLmxlbmd0aDtcblx0Ly8gXHRsZXQgbm4gPSB2YWx1ZXMuaW5kZXhPZih2YWwpO1xuXHQvLyBcdGlmIChubiA9PSAtMSkge1xuXHQvLyBcdFx0cmV0dXJuIHZhbHVlc1swXTtcblx0Ly8gXHR9XG5cdC8vIFx0ZWxzZSB7XG5cdC8vIFx0XHRyZXR1cm4gdmFsdWVzWyhubiArIDEpICUgc2l6ZV07XG5cdC8vIFx0fVxuXHQvLyB9LFxuXG5cdGNvbmZpZzogZnVuY3Rpb24oe1xuXHRcdHNyY0RvY3VtZW50LFxuXHRcdGRlc3REb2N1bWVudCxcblx0XHR3cmFwLFxuXHRcdGNhbGxiYWNrID0gKCkgPT4gJycsXG5cdFx0c2VsZWN0b3IsXG5cdFx0dGFyZ2V0LFxuXHRcdHNyY0F0dHJpYnV0ZSxcblx0XHRkZXN0QXR0cmlidXRlLFxuXHRcdHR5cGUgPSBcInBvc3RcIixcblx0XHRldmVudFR5cGUgPSBcImNsaWNrXCIsXG5cdH0pIHtcblxuXHRcdHNyY0RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCAoZSkgPT4ge1xuXHRcdFx0aWYgKGUudGFyZ2V0Lm1hdGNoZXMoc2VsZWN0b3IpIHx8IChzcmNBdHRyaWJ1dGUgJiYgZS50YXJnZXQuaGFzQXR0cmlidXRlKHNyY0F0dHJpYnV0ZSkpKSB7XG5cdFx0XHRcdGxldCB0YXJnZXRzID0gZGVzdERvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGFyZ2V0KTtcblx0XHRcdFx0dGFyZ2V0cy5mb3JFYWNoKCh0YXJnZXQpID0+IHtcblx0XHRcdFx0XHRsZXQgdmFsdWUgPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoc3JjQXR0cmlidXRlKTtcblx0XHRcdFx0XHRpZiAod3JhcCkgdmFsdWUgPSB3cmFwLnJlcGxhY2UoXCIkMVwiLCB2YWx1ZSk7XG5cdFx0XHRcdFx0aWYgKGRlc3RBdHRyaWJ1dGUpXG5cdFx0XHRcdFx0XHR0YXJnZXQuc2V0QXR0cmlidXRlKGRlc3RBdHRyaWJ1dGUsIHZhbHVlKTtcblx0XHRcdFx0XHRjYWxsYmFjayhlLnRhcmdldCwgdGFyZ2V0KVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlID09PSBcImN1dFwiKSBlLnRhcmdldC5yZW1vdmVBdHRyaWJ1dGUoc3JjQXR0cmlidXRlKTtcblx0XHR9KTtcblx0fSxcblxuXG5cdHNlbGVjdGVkOiBmdW5jdGlvbiBzZWxlY3RlZCgpIHtcblx0XHRmdW5jdGlvbiBhY3RpdmF0ZShkcywgZWwpIHtcblx0XHRcdGlmIChkc1tcInNlbGVjdGVkX2F0dHJpYnV0ZVwiXSlcblx0XHRcdFx0ZWwuc2V0QXR0cmlidXRlKGRzW1wic2VsZWN0ZWRfYXR0cmlidXRlXCJdLCBkc1tcInNlbGVjdGVkXCJdKTtcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRlbC5jbGFzc0xpc3QuYWRkKGRzW1wic2VsZWN0ZWRcIl0pO1xuXHRcdFx0XHRlbC5zZXRBdHRyaWJ1dGUoJ3NlbGVjdGVkJywgJycpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZGVhY3RpYXZlKGRzLCBlbCkge1xuXHRcdFx0aWYgKGRzW1wic2VsZWN0ZWRfYXR0cmlidXRlXCJdKVxuXHRcdFx0XHRlbC5yZW1vdmVBdHRyaWJ1dGUoZHNbXCJzZWxlY3RlZF9hdHRyaWJ1dGVcIl0sIGRzW1wic2VsZWN0ZWRcIl0pO1xuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoZHNbXCJzZWxlY3RlZFwiXSk7XG5cdFx0XHRcdGVsLnJlbW92ZUF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCAnJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZ2V0U2VsZWN0ZWQoZWwpIHtcblx0XHRcdHdoaWxlICghZWwuZGF0YXNldFsnc2VsZWN0ZWQnXSlcblx0XHRcdFx0aWYgKGVsLnBhcmVudEVsZW1lbnQpXG5cdFx0XHRcdFx0ZWwgPSBlbC5wYXJlbnRFbGVtZW50O1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0cmV0dXJuIGVsO1xuXG5cdFx0fVxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuXHRcdFx0bGV0IGVsID0gZ2V0U2VsZWN0ZWQoZS50YXJnZXQpO1xuXHRcdFx0aWYgKCFlbCkgcmV0dXJuO1xuXG5cdFx0XHRsZXQgZHMgPSBlbC5kYXRhc2V0O1xuXHRcdFx0bGV0IGdyb3VwID0gZHNbJ3NlbGVjdGVkX2dyb3VwJ10gPyBgLFtkYXRhLXNlbGVjdGVkX2dyb3VwPVwiJHtkc1tcInNlbGVjdGVkX2dyb3VwXCJdIHx8ICdudWxsJ31cIl1gIDogJydcblx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYCBbZGF0YS1zZWxlY3RlZF06bm90KFtkYXRhLXNlbGVjdGVkX2dyb3VwXSkke2dyb3VwfWApXG5cdFx0XHRcdC5mb3JFYWNoKChlbCkgPT4ge1xuXHRcdFx0XHRcdGxldCBkcyA9IGVsLmRhdGFzZXQ7XG5cdFx0XHRcdFx0ZGVhY3RpYXZlKGVsLmRhdGFzZXQsIGVsKVxuXHRcdFx0XHRcdGlmIChkc1tcInNlbGVjdGVkX3RhcmdldFwiXSlcblx0XHRcdFx0XHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoZHNbXCJzZWxlY3RlZF90YXJnZXRcIl0pLmZvckVhY2goKGVsKSA9PiBkZWFjdGlhdmUoZHMsIGVsKSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0YWN0aXZhdGUoZHMsIGVsKTtcblx0XHRcdGlmIChkc1tcInNlbGVjdGVkX3RhcmdldFwiXSlcblx0XHRcdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChkc1tcInNlbGVjdGVkX3RhcmdldFwiXSkuZm9yRWFjaCgoZWwpID0+IGFjdGl2YXRlKGRzLCBlbCkpO1xuXHRcdH0pO1xuXHR9XG5cbn1cblxuXG5cbkNvQ3JlYXRlU2VsZWN0ZWQuc2VsZWN0ZWQoKVxuXG5leHBvcnQgZGVmYXVsdCBDb0NyZWF0ZVNlbGVjdGVkO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///../CoCreate-selected/src/index.js\n")}}]);