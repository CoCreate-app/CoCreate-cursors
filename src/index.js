/********************************************************************************
 * Copyright (C) 2023 CoCreate and Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ********************************************************************************/

// Commercial Licensing Information:
// For commercial use of this software without the copyleft provisions of the AGPLv3,
// you must obtain a commercial license from CoCreate LLC.
// For details, visit <https://cocreate.app/licenses/> or contact us at sales@cocreate.app.

/*globals ResizeObserver*/
import observer from "@cocreate/observer";
import { getAttributeNames } from "@cocreate/utils";
import socket from "@cocreate/socket-client";
import uuid from "@cocreate/uuid";
import localStorage from "@cocreate/local-storage";
import { getElementPosition } from "@cocreate/selection";
import { randomColor } from "@cocreate/random-color";
import "./index.css";

const clientId = socket.clientId || uuid.generate(12);
const cursorBackground = randomColor();

let environment_prod = true;

let selector = "[array][object][key]:not([contentEditable='false'])";

function init() {
	let elements = document.querySelectorAll(selector);
	initElements(elements);
}

function initElements(elements) {
	for (let element of elements) initElement(element);
}

function initElement(element) {
	let realtime = element.getAttribute("realtime");
	let cursors = element.getAttribute("cursors");
	if (!realtime || realtime === "false" || cursors === "false") return;
	if (element.hasAttribute("actions")) return;
	if (element.cursor) return;
	element.cursor = true;
}

function initDocument(doc) {
	let documents;
	try {
		documents = window.top.cursorDocuments;
	} catch (e) {
		console.log("cross-origin failed");
	}

	if (!documents) {
		documents = new Map();
		try {
			window.top.cursorDocuments = documents;
		} catch (e) {
			console.log("cross-origin failed");
		}
	}
	if (!documents.has(doc)) {
		initResizeObserver(doc.documentElement);
		documents.set(doc);
	}
}

function drawCursors(selection) {
	const socket_id = selection["socketId"];
	const array = selection["array"];
	const object = selection["object"];
	const key = selection["key"];
	let elements = selection.element;
	if (!elements) {
		let selector =
			'[array="' +
			array +
			'"][object="' +
			object +
			'"][key="' +
			key +
			'"]';
		selector += ":not([actions])";
		elements = document.querySelectorAll(selector);
	}
	for (let element of elements) {
		let start = selection["start"];
		let end = selection["end"];
		if (
			window.activeElement == element &&
			socket.frameId === selection.frameId
		) {
			continue;
		}
		let realtime = element.getAttribute("realtime");
		let cursors = element.getAttribute("cursors");
		let contenteditable = element.getAttribute("contenteditable");
		if (!realtime || realtime == "false" || cursors == "false") continue;
		if (element.tagName != "INPUT" && element.tagName != "TEXTAREA")
			if (contenteditable == "false" || contenteditable === null) {
				if (cursors != "true") continue;
			}

		let domTextEditor = element;

		if (element.hasAttribute("contenteditable")) {
			contenteditable = true;
			// let domTextEditor = element;
			if (element.tagName == "IFRAME") {
				// let frameClientId = element.contentDocument.defaultView.CoCreateSockets.id;
				// if (frameClientId == selection.socketId) continue;
				domTextEditor = element =
					element.contentDocument.documentElement;

				let pos = getElementPosition(
					domTextEditor.htmlString,
					start,
					end
				);

				if (pos.path) {
					element = element.querySelector(pos.path);
					if (pos.start) {
						let endPos = end - start;
						if (endPos > 0) end = pos.start + endPos;
						else end = pos.start;
						start = pos.start;
					}
				}
			}

			if (!domTextEditor.htmlString) continue;

			// let pos = getElementPosition(domTextEditor.htmlString, start, end);

			// if (pos.path) {
			//     element = domTextEditor.querySelector(pos.path);
			//     if (pos.start) {
			//         let endPos = end - start;
			//         if (endPos > 0)
			//             end = pos.start + endPos;
			//         else
			//             end = pos.start;
			//         start = pos.start;
			//     }
			// }
		}

		if (!element) continue;
		let document = element.ownerDocument;
		let mirrorDiv;
		let id_mirror = element.getAttribute("mirror_id");
		if (!id_mirror) {
			id_mirror = uuid.generate(8);
			element.setAttribute("mirror_id", id_mirror);

			mirrorDiv = document.createElement("cursor-container");
			mirrorDiv.id = id_mirror;
			mirrorDiv.className = environment_prod
				? "mirror mirror_scroll mirror_color"
				: "mirror mirror_scroll";
			mirrorDiv.contentEditable = false;
			mirrorDiv.element = element;
			if (element.tagName === "HTML")
				element.insertAdjacentElement("beforeend", mirrorDiv);
			else element.insertAdjacentElement("afterend", mirrorDiv);
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
		} else mirrorDiv = document.getElementById(id_mirror);

		let computed = getComputedStyle(element);
		let rect = element.getBoundingClientRect();

		let borderWidth = parseInt(computed["border-width"]) * 2;
		let scrollBarWidth = 0;
		if (element.clientWidth != 0)
			scrollBarWidth =
				element.offsetWidth - element.clientWidth - borderWidth;

		let style = mirrorDiv.style;
		style.position = "absolute";
		style.width = rect.width + "px";
		style.height = rect.height + "px";
		style.margin = "0px";
		style.borderColor = "transparent";
		style.outlineColor = "transparent";

		style.overflowX = computed["overflowX"];
		style.overflowY = computed["overflowY"];
		style.padding = computed["padding"];
		style.border = computed["border"];
		style.outline = computed["outline"];

		if (
			element.parentElement &&
			element.parentElement.style["display"] == "inline"
		) {
			style.top = element.clientTop + "px";
			style.left = element.clientLeft + "px";
		} else {
			style.top = element.offsetTop + "px";
			style.left = element.offsetLeft + "px";
		}

		if (contenteditable) {
			const actualStyles = getActualStyles(element);
			for (const [prop, value] of Object.entries(actualStyles)) {
				style[prop] = value;
			}
		} else {
			let properties = [
				"boxSizing",
				"fontStyle",
				"fontVariant",
				"fontWeight",
				"fontStretch",
				"fontSize",
				"fontFamily",
				"letterSpacing",
				"lineHeight",
				"textAlign",
				"textTransform",
				"textIndent",
				"textDecoration",
				"textRendering",
				"textTransform",
				"textIndent",
				"overflowWrap",
				"tabSize",
				"webkitWritingMode",
				"whiteSpace",
				"wordSpacing"
			];
			properties.forEach(function (prop) {
				style[prop] = computed[prop];
			});

			let paddingBottom = parseFloat(
				computed["padding-bottom"].replace("px", "")
			);
			style.height = rect.height - paddingBottom + "px";

			if (element.nodeName === "INPUT") style.whiteSpace = "pre";
		}

		let cursor, cursorFlag;
		let details = { array, object, key };
		if (socket_id) {
			let selection_user = mirrorDiv.querySelector(
				`selection[socket_id="${socket_id}"]`
			);
			if (selection_user && selection_user.details != details)
				selection_user.remove();

			selection_user = document.createElement("selection");
			selection_user.setAttribute("socket_id", socket_id);
			selection_user.style["position"] = "absolute";
			let style_mirror = getComputedStyle(mirrorDiv);
			selection_user.style["top"] = style_mirror.paddingTop;
			selection_user.style["left"] = style_mirror.paddingLeft;
			selection_user.style["width"] =
				mirrorDiv.clientWidth -
				parseInt(computed["padding-left"]) -
				parseInt(computed["padding-right"]) -
				scrollBarWidth +
				"px";
			selection_user.details = { array, object, key };

			let value_element =
				["TEXTAREA", "INPUT"].indexOf(element.nodeName) == -1
					? element.innerHTML
					: element.value;
			if (contenteditable) {
				selection_user.innerHTML = value_element.substring(0, start);
			} else
				selection_user.textContent = value_element.substring(0, start);

			let selectionElement;
			if (contenteditable) {
				selectionElement = getElementPosition(
					domTextEditor.htmlString,
					selection.start,
					selection.end
				);
			}

			let lastChildTagName, lastChildElement;
			if (
				selectionElement &&
				selectionElement.element &&
				selectionElement.position !== "afterend"
			) {
				lastChildElement = selection_user.lastElementChild;
				if (lastChildElement)
					lastChildTagName = lastChildElement.tagName.toLowerCase();
			}

			let selectedText = document.createElement("selected-text");
			selectedText.style["backgroundColor"] = selection.background;

			let setCursorInLastChild = false;
			if (contenteditable) {
				if (lastChildTagName && start !== end) {
					let selectedTextFrag =
						document.createElement("selected-text");
					selectedTextFrag.style["backgroundColor"] =
						selection.background;

					const closingTagRegex = new RegExp(
						"</\\s*" + lastChildTagName + "\\s*>",
						"i"
					);
					let secondHalfString =
						value_element.substring(start, end) || "";
					const closingTagMatch =
						secondHalfString.match(closingTagRegex);
					// console.log('secondHalfString', secondHalfString)

					let closingTagEnd;
					if (closingTagMatch) {
						closingTagEnd =
							closingTagMatch.index + closingTagMatch[0].length;
						// console.log('closingTagEnd', closingTagEnd)

						selectedTextFrag.innerHTML =
							secondHalfString.substring(0, closingTagEnd) || "";
						lastChildElement.appendChild(selectedTextFrag);
						// console.log('selectedTextFrag', selectedTextFrag)

						selectedText.innerHTML =
							value_element.substring(
								start + closingTagEnd,
								end
							) || "";
						// console.log('selectedText', selectedText)
					} else {
						selectedText.innerHTML =
							value_element.substring(start, end) || "";
						setCursorInLastChild = true;
					}
				} else {
					if (lastChildTagName) setCursorInLastChild = true;

					selectedText.innerHTML =
						value_element.substring(start, end) || "";
				}
			} else {
				selectedText.textContent =
					value_element.substring(start, end) || "";
			}

			cursor = document.createElement("cursor");
			cursor.setAttribute("socket_id", socket_id);
			cursor.dataset.start = start;
			cursor.dataset.end = end;
			cursor.setAttribute("user-name", selection.userName);
			cursor.setAttribute("user-background", selection.background);
			cursor.setAttribute("user-color", selection.color);
			cursor.style["background"] = selection.background;
			cursor.details = { array, object, key };
			cursor.textContent = " ";

			cursorFlag = document.createElement("cursor-flag");
			cursorFlag.setAttribute("array", "users");
			cursorFlag.setAttribute("object", selection.user_id);
			cursorFlag.setAttribute("key", "name");
			cursorFlag.style["background"] = selection.background;
			cursorFlag.innerHTML = selection.userName;
			cursor.appendChild(cursorFlag);

			if (setCursorInLastChild) {
				lastChildElement.appendChild(selectedText);
				lastChildElement.appendChild(cursor);
			} else {
				selection_user.appendChild(selectedText);
				selection_user.appendChild(cursor);
			}

			let span_end = document.createElement("span-end");
			let value_end = value_element.substring(end) || "";
			if (contenteditable) span_end.innerHTML = value_end;
			else span_end.textContent = value_end;

			selection_user.appendChild(span_end);

			mirrorDiv.appendChild(selection_user);
		}
		scrollMirror(element);
	}
}

function getActualStyles(element) {
	const actualStyles = {};

	// Copy styles that are directly applied to the element (inline styles)
	for (const prop in element.style) {
		if (element.style[prop]) {
			actualStyles[prop] = element.style[prop];
		}
	}

	// Get styles from classes, IDs, attributes, and tag names
	for (const sheet of document.styleSheets) {
		try {
			for (const rule of sheet.cssRules) {
				if (element.matches(rule.selectorText)) {
					for (const prop of rule.style) {
						actualStyles[prop] = rule.style.getPropertyValue(prop);
					}
				}
			}
		} catch (e) {
			console.warn("Unable to access stylesheet:", e);
		}
	}

	return actualStyles;
}

function updateCursors(element) {
	let mirrorDivs = [];
	let id_mirror = element.getAttribute("mirror_id");
	if (id_mirror) {
		let mirrorDiv = element.ownerDocument.getElementById(id_mirror);
		if (mirrorDiv) mirrorDivs = [mirrorDiv];
	} else {
		mirrorDivs = element.querySelectorAll(".mirror");
	}

	for (let mirrorDiv of mirrorDivs) {
		element = mirrorDiv.element;
		let cursors = mirrorDiv.querySelectorAll("cursor");

		cursors.forEach(function (child_cursor, index, array) {
			let socketId = child_cursor.getAttribute("socket_id");
			let userName = child_cursor.getAttribute("user-name");
			let background = child_cursor.getAttribute("user-background");
			let color = child_cursor.getAttribute("user-color");
			let start = child_cursor.getAttribute("data-start");
			let end = child_cursor.getAttribute("data-end");
			let selection = {
				element: [element],
				start,
				end,
				socketId,
				userName,
				background,
				color
			};
			drawCursors(selection);
		});
	}
}

function removeCursor(socketId) {
	let elements = document.querySelectorAll(`cursor[socket_id="${socketId}"]`);
	elements.forEach(function (element, index, array) {
		element.parentNode.removeChild(element);
	});

	let sel_elements = document.querySelectorAll(
		`selection[socket_id="${socketId}"]`
	);
	sel_elements.forEach(function (sel_element, index, array) {
		sel_element.parentNode.removeChild(sel_element);
	});
}

function _initEvents(element) {
	element.addEventListener("keydown", function (event) {
		scrollMirror(element);
	});

	element.addEventListener("scroll", function () {
		scrollMirror(element);
	});

	initResizeObserver(element);
}

function scrollMirror(element) {
	let id_mirror = element.getAttribute("mirror_id");
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
		socket.send({
			method: "cursor",
			data: {
				array: info.array,
				object: info.object,
				key: info.key,
				start: info.start,
				end: info.end,
				color: info.color || localStorage.getItem("cursorColor"),
				background:
					info.background ||
					localStorage.getItem("cursorBackground") ||
					cursorBackground,
				userName:
					info.userName ||
					localStorage.getItem("userName") ||
					clientId,
				user_id:
					info.user_id || localStorage.getItem("user_id") || clientId
			},
			broadcastBrowser: true
		});
	} catch (e) {
		console.error(e);
	}
}

socket.listen("cursor", function (response) {
	// if (socket.has(selection.socketId)) return;
	let selection = response.data;
	selection.socketId = response.socketId;
	selection.frameId = response.frameId;
	if (selection.start != null && selection.end != null)
		drawCursors(selection);
	else removeCursor(selection.socketId);
});

observer.init({
	name: "CoCreateCursor",
	types: ["addedNodes"],
	selector: "[array][object][key]",
	callback: function (mutation) {
		initElement(mutation.target);
	}
});

observer.init({
	name: "CoCreateCursorAtt",
	types: ["attributes"],
	attributeFilter: getAttributeNames(["array", "object", "key"]),
	callback: function (mutation) {
		initElement(mutation.target);
	}
});

init();

export default { drawCursors, updateCursors, removeCursor, sendPosition };
