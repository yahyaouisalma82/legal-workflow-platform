(function () {
  const container = document.querySelector("[data-workflow-id]");
  if (!container) return;

  const workflowId = container.getAttribute("data-workflow-id");
  const apiBase =
    container.getAttribute("data-api-base") || window.location.origin;

  let workflow = null;

  container.innerHTML = "Loading...";

  fetch(`${apiBase}/api/workflows/${workflowId}`)
    .then((res) => res.json())
    .then((data) => {
      workflow = data;
      renderWorkflow(container, workflow);
    })
    .catch(() => {
      container.innerHTML = "Failed to load form";
    });

  function renderWorkflow(container, workflow) {
    container.innerHTML = "";

    const form = document.createElement("form");
    form.style.display = "flex";
    form.style.flexDirection = "column";
    form.style.gap = "12px";

    const fieldErrorNodes = {};

    // ---------------------------
    // FIELD RENDERING
    // ---------------------------
    workflow.fields.forEach((field) => {
      const wrapper = document.createElement("div");

      const label = document.createElement("label");
      label.textContent = field.label;
      label.style.color = workflow.theme.primaryColor;
      wrapper.appendChild(label);

      const errorNode = document.createElement("div");
      errorNode.style.color = "red";
      errorNode.style.fontSize = "18px";
      errorNode.style.minHeight = "14px";

      fieldErrorNodes[field.id] = errorNode;

      if (field.type === "text" || field.type === "email") {
        const input = document.createElement("input");
        input.type = field.type;
        input.name = field.id;

        applyTheme(input, workflow.theme);
        wrapper.appendChild(input);
      }

      if (field.type === "select") {
        const select = document.createElement("select");
        select.name = field.id;

        applyTheme(select, workflow.theme);

        field.options.forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });

        wrapper.appendChild(select);
      }

      if (field.type === "radio") {
        const group = document.createElement("div");

        field.options.forEach((opt, index) => {
          const label = document.createElement("label");
          label.style.display = "block";

          const input = document.createElement("input");
          input.type = "radio";
          input.name = field.id;
          input.value = opt;

          if (index === 0) input.checked = true;

          label.appendChild(input);
          label.appendChild(document.createTextNode(" " + opt));

          group.appendChild(label);
        });

        wrapper.appendChild(group);
      }

      wrapper.appendChild(errorNode);
      form.appendChild(wrapper);
    });

    // ---------------------------
    // BUTTON
    // ---------------------------
    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Submit";

    button.style.background = workflow.theme.primaryColor;
    button.style.color = "white";
    button.style.border = "none";
    button.style.padding = "10px";
    button.style.borderRadius = workflow.theme.borderRadius;

    form.appendChild(button);

    // start disabled
    setButtonState(true);

    // ---------------------------
    // ERROR HELPERS
    // ---------------------------
    function setError(fieldId, message) {
      const node = fieldErrorNodes[fieldId];
      if (node) node.textContent = message;
    }

    function clearErrors() {
      Object.values(fieldErrorNodes).forEach((node) => {
        node.textContent = "";
      });
    }

    function setButtonState(disabled) {
      button.disabled = disabled;

      button.style.opacity = disabled ? "0.5" : "1";
      button.style.cursor = disabled ? "not-allowed" : "pointer";
    }

    // ---------------------------
    // VALIDATION (LIVE)
    // ---------------------------
    function isFormValid() {
      return workflow.fields.every((field) => {
        let value = "";

        if (field.type === "radio") {
          const selected = form.querySelector(
            `input[name="${field.id}"]:checked`,
          );
          value = selected ? selected.value : "";
        } else {
          value = form.elements[field.id]?.value || "";
        }

        if (!value.trim()) return false;

        if (field.type === "email") {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        return true;
      });
    }

    function refreshSubmitState() {
      setButtonState(!isFormValid());
    }

    // ---------------------------
    // ATTACH LISTENERS (LIVE UPDATE)
    // ---------------------------
    workflow.fields.forEach((field) => {
      if (field.type === "radio") {
        form.querySelectorAll(`input[name="${field.id}"]`).forEach((input) => {
          input.addEventListener("change", refreshSubmitState);
        });
      } else {
        const input = form.elements[field.id];

        if (input) {
          input.addEventListener("input", refreshSubmitState);
          input.addEventListener("change", refreshSubmitState);
        }
      }
    });

    refreshSubmitState();

    // ---------------------------
    // SUBMIT
    // ---------------------------
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      clearErrors();

      const values = {};
      let hasError = false;

      workflow.fields.forEach((field) => {
        let value = "";

        if (field.type === "radio") {
          const selected = form.querySelector(
            `input[name="${field.id}"]:checked`,
          );
          value = selected ? selected.value : "";
        } else {
          value = form.elements[field.id]?.value || "";
        }

        if (!value) {
          setError(field.id, `${field.label} is required`);
          hasError = true;
        }

        if (field.type === "email" && value) {
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          if (!ok) {
            setError(field.id, "Invalid email format");
            hasError = true;
          }
        }

        values[field.id] = value;
      });

      if (hasError) return;

      setButtonState(true);
      button.textContent = "Submitting...";

      try {
        const res = await fetch(`${apiBase}/api/submissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowId,
            data: values,
          }),
        });

        if (!res.ok) throw new Error("Request failed");

        form.innerHTML = "";

        const success = document.createElement("div");
        success.textContent = "Submitted successfully";
        success.style.color = "green";

        form.appendChild(success);
      } catch (error) {
        alert("Submission failed");
      } finally {
        setButtonState(false);
        button.textContent = "Submit";
      }
    });

    container.appendChild(form);
  }

  function applyTheme(el, theme) {
    el.style.width = "100%";
    el.style.padding = "8px";
    el.style.border = "1px solid #ddd";
    el.style.borderRadius = theme.borderRadius;
    el.style.fontSize = "18px";
  }
})();
