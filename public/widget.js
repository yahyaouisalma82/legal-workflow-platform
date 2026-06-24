(function () {
    const container = document.querySelector(
        "[data-workflow-id]"
    );

    if (!container) {
        return;
    }

    const workflowId =
        container.getAttribute("data-workflow-id");

    const apiBase =
        container.getAttribute("data-api-base") ||
        window.location.origin;

    fetch(
        `${apiBase}/api/workflows/${workflowId}`
    )
        .then((res) => res.json())
        .then((workflow) => {
            console.log({workflow});
            renderWorkflow(container, workflow);
        })
        .catch(console.error);

    function renderWorkflow(container, workflow) {
        container.innerHTML = "";

        const form = document.createElement("form");

        form.style.display = "flex";
        form.style.flexDirection = "column";
        form.style.gap = "12px";

        workflow.fields.forEach((field) => {
            const wrapper =
                document.createElement("div");

            const label =
                document.createElement("label");

            label.textContent = field.label;

            label.style.color =
                workflow.theme.primaryColor;

            wrapper.appendChild(label);

            if (field.type === "text") {
                const input =
                    document.createElement("input");

                input.type = "text";

                applyTheme(
                    input,
                    workflow.theme
                );

                input.name = field.id;

                wrapper.appendChild(input);
            }

            if (field.type === "select") {
                const select =
                    document.createElement("select");

                applyTheme(
                    select,
                    workflow.theme
                );

                select.name = field.id;

                field.options.forEach((option) => {
                    const opt =
                        document.createElement(
                            "option"
                        );

                    opt.value = option;
                    opt.textContent = option;

                    select.appendChild(opt);
                });

                wrapper.appendChild(select);
            }

            form.appendChild(wrapper);
        });

        const button =
            document.createElement("button");

        button.type = "submit";
        button.textContent = "Submit";

        button.style.background =
            workflow.theme.primaryColor;

        button.style.color = "white";

        button.style.border = "none";

        button.style.padding = "10px";

        button.style.borderRadius =
            workflow.theme.borderRadius;

        form.appendChild(button);

        form.addEventListener(
            "submit",
            async (e) => {
                e.preventDefault();

                const values = {};

                workflow.fields.forEach(
                    (field) => {
                        values[field.id] =
                            form.elements[
                                field.id
                                ].value;
                    }
                );

                await fetch(
                    `${apiBase}/api/submissions`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            workflowId:
                            workflow.id,
                            data: values,
                            webhookUrl:
                            workflow.webhookUrl,
                        }),
                    }
                );

                alert("Submitted");
            }
        );

        container.appendChild(form);
    }

    function applyTheme(el, theme) {
        el.style.width = "100%";
        el.style.padding = "8px";
        el.style.border =
            "1px solid #ddd";
        el.style.borderRadius =
            theme.borderRadius;
        el.style.fontSize =
            theme.fontSize;
    }
})();