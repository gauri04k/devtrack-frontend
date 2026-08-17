import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,

    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },

    timeout: 10000,
});

axiosClient.interceptors.request.use(

    (config) => {

        console.log("");
        console.log("========================================");
        console.log("AXIOS REQUEST");
        console.log("========================================");

        console.log(
            "Request Method:",
            config.method ?
            config.method.toUpperCase() :
            ""
        );

        console.log(
            "Request URL:",
            (config.baseURL || "") + (config.url || "")
        );


        const storedAuth =
            localStorage.getItem("devtrack_auth");


        if (!storedAuth) {

            console.log(
                "AUTH: No authentication data found"
            );

            console.log("========================================");

            return config;
        }


        try {

            const parsedAuth =
                JSON.parse(storedAuth);


            console.log(
                "AUTH USER ID:",
                parsedAuth && parsedAuth.userId
            );

            console.log(
                "AUTH EMAIL:",
                parsedAuth && parsedAuth.email
            );

            console.log(
                "AUTH TOKEN TYPE:",
                parsedAuth && parsedAuth.tokenType
            );


            const token =
                parsedAuth && parsedAuth.token;


            if (!token) {

                console.log(
                    "AUTH TOKEN: NOT FOUND"
                );

                console.log("========================================");

                return config;
            }


            console.log(
                "AUTH TOKEN: FOUND"
            );


            config.headers.Authorization =
                `Bearer ${token}`;


            console.log(
                "Authorization Header: Bearer [TOKEN PRESENT]"
            );
            try {

                const tokenParts =
                    token.split(".");


                if (tokenParts.length === 3) {

                    const payload =
                        JSON.parse(
                            atob(tokenParts[1])
                        );


                    console.log(
                        "JWT SUBJECT:",
                        payload && payload.sub
                    );

                    console.log(
                        "JWT ISSUED AT:",
                        payload && payload.iat
                    );

                    console.log(
                        "JWT EXPIRATION:",
                        payload && payload.exp
                    );

                } else {

                    console.log(
                        "JWT: Invalid token structure"
                    );
                }

            } catch (jwtError) {

                console.error(
                    "Could not decode JWT payload:",
                    jwtError
                );
            }

        } catch (error) {

            console.error(
                "Invalid authentication data:",
                error
            );

            localStorage.removeItem(
                "devtrack_auth"
            );
        }
        console.log("========================================");

        return config;
    },


    (error) => {

        console.error(
            "AXIOS REQUEST ERROR:",
            error
        );

        return Promise.reject(error);
    }
);

axiosClient.interceptors.response.use(

    (response) => {

        console.log("");
        console.log("========================================");
        console.log("AXIOS RESPONSE");
        console.log("========================================");

        console.log(
            "Status:",
            response.status
        );

        console.log(
            "URL:",
            response.config ?
            response.config.url :
            ""
        );

        console.log(
            "Response Data:",
            response.data
        );

        console.log("========================================");
        console.log("");

        return response;
    },


    (error) => {

        console.log("");
        console.log("========================================");
        console.log("AXIOS RESPONSE ERROR");
        console.log("========================================");


        console.error(
            "Request:",
            (
                error.config ?
                error.config.baseURL :
                ""
            ) +
            (
                error.config ?
                error.config.url :
                ""
            )
        );


        console.error(
            "Status:",
            error.response ?
            error.response.status :
            "NO RESPONSE"
        );


        console.error(
            "Response:",
            error.response ?
            error.response.data :
            "NO RESPONSE DATA"
        );

        if (
            error.response &&
            error.response.status === 401
        ) {

            console.error(
                "AUTHENTICATION ERROR: 401"
            );

            console.error(
                "Authentication expired or unauthorized."
            );


            localStorage.removeItem(
                "devtrack_auth"
            );


            window.dispatchEvent(
                new Event("auth:logout")
            );
        }
        if (
            error.response &&
            error.response.status === 403
        ) {

            console.error(
                "AUTHORIZATION ERROR: 403"
            );

            console.error(
                "The server received the request but refused access."
            );

            console.error(
                "Check JWT token, user ID and backend authorization."
            );
        }


        console.log("========================================");
        console.log("");


        return Promise.reject(error);
    }
);


export default axiosClient;