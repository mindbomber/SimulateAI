// Modern Form/Input Web Components
class CustomInput extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const wrapper = document.createElement("div");
    wrapper.className = "form-group";
    const label = document.createElement("label");
    label.textContent = this.getAttribute("label") || "";
    label.htmlFor = "input";
    const input = document.createElement("input");
    input.type = this.getAttribute("type") || "text";
    input.className = "custom-input";
    input.id = "input";
    input.name = this.getAttribute("name") || "";
    input.placeholder = this.getAttribute("placeholder") || "";
    if (this.hasAttribute("value")) input.value = this.getAttribute("value");
    if (this.hasAttribute("required")) input.required = true;
    if (this.hasAttribute("disabled")) input.disabled = true;
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "src/styles/form-input-components.css";
    shadow.appendChild(style);
    shadow.appendChild(wrapper);
  }
}

class CustomButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const button = document.createElement("button");
    button.className = "custom-button";
    button.type = this.getAttribute("type") || "button";
    button.textContent = this.getAttribute("label") || "Submit";
    if (this.hasAttribute("disabled")) button.disabled = true;
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "src/styles/form-input-components.css";
    shadow.appendChild(style);
    shadow.appendChild(button);
  }
}

customElements.define("custom-input", CustomInput);
customElements.define("custom-button", CustomButton);
