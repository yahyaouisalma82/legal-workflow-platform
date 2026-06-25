import Script from "next/script";

export default function WidgetTestPage() {
    return (
        <div className={"flex flex-col justify-center p-8"}>
            <h1 className={"flex items-center justify-center text-2xl text-red-500"}>Welcome to our website</h1>
            <div className={"m-0 p-8"}
                data-workflow-id="QyB26g4PBvbkUxUGwTto"
                data-api-base="http://localhost:3000"
            />

            <Script
                src="/widget.js"
                strategy="afterInteractive"
            />
        </div>
    );
}