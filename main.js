const el = {
	recipientList: document.getElementById("recipients"),
	noRecipient: document.getElementById("no-recipient"),
	templateSelect: document.getElementById("template-select"),
	customOptgroup: document.querySelector("optgroup#custom"),
	readmeText: document.getElementById("readme"),
	preview: document.getElementById("preview"),
	name: document.getElementById("name"),
	printBack: document.getElementById("print-back"),
	emojiList: document.getElementById("emoji-list")
};

const getRecipientCount = () =>
	Array.from(el.recipientList.children).filter(
		(element) => element instanceof HTMLLIElement
	).length;

el.templateSelect.addEventListener("change", onTemplateChange);
el.name.addEventListener("input", preview);

if (localStorage.vgenCustomTemplates) {
	let templates = JSON.parse(localStorage.vgenCustomTemplates);
	for (const template in templates) {
		if (Object.hasOwnProperty.call(templates, template)) {
			const md = templates[template];

			const opt = document.createElement("option");
			opt.value = `_txt${md}`;
			opt.innerText = template;
			el.customOptgroup.appendChild(opt);
		}
	}
} else {
	el.customOptgroup.style.display = "none";
}

async function importRecipients() {
	if (getRecipientCount() > 0 && !confirm("Override exsisting recipients?"))
		return;

	let text = await navigator.clipboard.readText();

	let recipients;
	if (text.includes(",")) {
		recipients = text.split(",");
	} else if (text.includes("\n")) {
		recipients = text.split("\n");
	} else {
		alert(
			"Cannot read recipients from clipboard. Please try using ',' to seperate recipients."
		);
		return;
	}

	Array.from(el.recipientList.children).forEach((child) => {
		if (child instanceof HTMLLIElement) child.remove();
	});

	recipients.forEach((name, i) => {
		const li = document.createElement("li");
		li.innerText = name + " ";

		const delBtn = document.createElement("button");
		delBtn.innerHTML = "Delete";
		delBtn.onclick = () => {
			li.remove();
			if (getRecipientCount() == 0) {
				el.noRecipient.style.display = "block";
			}
		};
		li.appendChild(delBtn);

		el.recipientList.appendChild(li);
	});
	el.noRecipient.style.display = "none";
}

async function onTemplateChange() {
	if (el.templateSelect.value == "_upload") {
		const input = document.createElement("input");
		input.type = "file";
		input.style.display = "none";

		document.body.appendChild(input);
		input.click();

		let file = await new Promise((resolve) => {
			input.onchange = (e) => {
				resolve(e.target.files[0]);
			};
		});

		document.body.removeChild(input);

		if (file == undefined) {
			el.templateSelect.value = "templates/default.md";

			return;
		}

		let reader = new FileReader();
		reader.readAsText(file);

		/** @type {string} */
		let text = await new Promise((resolve) => {
			reader.onload = (e) => {
				resolve(e.target.result);
			};
		});

		let filename = input.value.split(".")[0].split("\\").slice(-1);
		console.log(filename, input.value);

		if (localStorage.vgenCustomTemplates) {
			localStorage.vgenCustomTemplates = JSON.stringify({
				...JSON.parse(localStorage.vgenCustomTemplates),
				[filename]: text
			});
		} else {
			localStorage.vgenCustomTemplates = JSON.stringify({ [filename]: text });
		}

		location.reload();
	}

	preview();
}

async function preview() {
	let template = (el.templateSelect.value.startsWith("_txt")
		? el.templateSelect.value.split("_txt")[1]
		: await fetch(el.templateSelect.value).then((r) => r.text())
	).replace("{NAME}", el.name.value);

	el.preview.innerHTML = markdown(template);
}

function addRecipient() {
	let name = prompt("Name:");

	const li = document.createElement("li");
	li.innerText = name + " ";

	const delBtn = document.createElement("button");
	delBtn.innerHTML = "Delete";
	delBtn.onclick = () => {
		li.remove();
		if (getRecipientCount() == 0) {
			el.noRecipient.style.display = "block";
		}
	};
	li.appendChild(delBtn);

	el.recipientList.appendChild(li);
	el.noRecipient.style.display = "none";
}

async function printCards() {
	let template = (el.templateSelect.value.startsWith("_txt")
		? el.templateSelect.value.split("_txt")[1]
		: await fetch(el.templateSelect.value).then((r) => r.text())
	).replace("{NAME}", document.getElementById("name").value);
	let html = "";
	let insert = "";

	Array.from(el.recipientList.children)
		.filter((element) => element instanceof HTMLLIElement)
		.map((e) => e.innerHTML.split("<")[0])
		.forEach((name, i) => {
			html += `<div class="card">${markdown(
				template.replace("{RECIPIENT}", name)
			)}</div>`;
			if (el.printBack.value == "on") {
				let emojiList = el.emojiList.value.split("\n");
				insert += `<div class="card back"><span class="emoji">${
					emojiList[Math.floor(Math.random() * emojiList.length)]
				}</span>To: ${name}</div>`;
				if ((i + 1) % 2 == 0) {
					html += insert;
					insert = "";
				}
			}
		});

	document.getElementById("print").innerHTML = html;
	print();
}
