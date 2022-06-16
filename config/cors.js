const whiteList = [process.env.FRONTEND_URL]

const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.includes(origin)) {
            callback(null, true)
        }
    }
}

export default corsOptions