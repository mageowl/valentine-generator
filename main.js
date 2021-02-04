const el = {
	recipientList: document.getElementById("recipients"),
	noRecipient: document.getElementById("no-recipient"),
	templateSelect: document.getElementById("template-select"),
	customOptgroup: document.querySelector("optgroup#custom")
};

const getRecipientCount = () =>
	Array.from(el.recipientList.children).filter(
		(element) => element instanceof HTMLLIElement
	).length;

el.templateSelect.addEventListener("change", onTemplateChange);

if (localStorage.vgenCustomTemplates) {
	let templates = JSON.parse(localStorage.vgenCustomTemplates);
	for (const template in templates) {
		if (Object.hasOwnProperty.call(templates, template)) {
			const md = templates[template];

			const opt = document.createElement("option");
			opt.value = `_txt${md}`;
			console.log(opt.value);
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

		if (file == undefined) return;

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

	Array.from(el.recipientList.children)
		.filter((element) => element instanceof HTMLLIElement)
		.map((e) => e.innerHTML.split("<")[0])
		.forEach((name) => {
			html += `<div class="card-inside">${markdown(
				template.replace("{RECIPIENT}", name)
			)}</div>`;
		});

	document.getElementById("print").innerHTML = html;
	print();
}
