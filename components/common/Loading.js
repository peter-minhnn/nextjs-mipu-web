import Head from "next/head";
function Loading() {
    return (
        <div>
            <Head>
                <title>Mipu 2.0</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <h1 className="title-loading">Cooking in progress..</h1>
            <div id="cooking">
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div className="bubble"></div>
                <div id="area">
                    <div id="sides">
                        <div id="pan"></div>
                        <div id="handle"></div>
                    </div>
                    <div id="pancake">
                        <div id="pastry"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loading
