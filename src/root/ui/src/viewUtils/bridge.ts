import vars from "./viewsVars";

const server = {
  url: `${vars.serverFakeAddress}`,

  options: (method: string, body?: {}) => {
    // console.log(body);
    const options: RequestInit = {
      // mode: "no-cors",
      cache: "no-cache",
      method,
      headers: {
        Accept: "application.json",
        "Content-Type": "application/json",
      },
    };

    if (body) options.body = JSON.stringify(body);

    return options;
  },
};

const handleFirstReponse = async (res) => {
  let jsonParsedResponse;
  try {
    jsonParsedResponse = await res.json();
  } catch (err) {
    console.log("Failed to get .json() [handleFirstResponse]", { err });
  }
  return {
    data: jsonParsedResponse?.data,
    status: res.status,
  };
};

const methods = {
  post: (route: string, body?: {}) => {
    return fetch(`${server.url}/${route}`, server.options("post", body))
      .then(async (res) => {
        return await handleFirstReponse(res);
      })
      .catch((err) => {
        console.log("Failed to get response [methods]", { err });
      });
  },

  read: (route: string) =>
    fetch(`${server.url}/${route}`, server.options("get"))
      .then(async (res) => {
        return await handleFirstReponse(res);
      })
      .catch((err) => {
        console.log("Failed to get response [methods]", { err });
      }),

  update: (route: string, body?: {}) => {
    // console.log('update route', route)
    return fetch(`${server.url}/${route}`, server.options("put", body))
      .then(async (res) => {
        return await handleFirstReponse(res);
      })
      .catch((err) => {
        console.log("Failed to get response [methods]", { err });
      });
  },

  remove: (route: string, body?: {}) =>
    fetch(`${server.url}/${route}`, server.options("delete", body))
      .then(async (res) => {
        return await handleFirstReponse(res);
      })
      .catch((err) => false),
};

const sleep = (t: number) => new Promise((resolve) => setTimeout(resolve, t));

// I could've used a proxy but this is so much easier
const handleRequest = async (
  method: "post" | "read" | "update" | "updateFile" | "remove",
  route: string,
  body?: {}
) => {
  if (route[0] == "/") {
    route = route.slice(1);
  }

  let response: { err?: any; data?: any; status: number };
  try {
    response = await methods[method](route, body);
  } catch (err) {
    //   toast.error(`client error while trying to make a request. route:${route}`)
    console.log(
      `client error while trying to make a request. route:${route}`,
      err
    );
    return { err: "connectionError", route };
  }

  // console.log({ response });
  if (response?.status != 200) {
    console.log(`${response}. route: ${route}`);
    return { err: "serverError" };
  }

  return response;
};

export default handleRequest;
