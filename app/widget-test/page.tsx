import Script from "next/script";

export default function WidgetTestPage() {
    return (
        <div className={"flex flex-col justify-center p-8"}>
            <h1>Welcome to our website</h1>
            <div className={"m-0 p-8"}
                data-workflow-id="MqcJPm3HCo3CXAhGk9h1"
                data-api-base="http://localhost:3000"
            />

            <Script
                src="/widget.js"
                strategy="afterInteractive"
            />
        </div>
    );
}