// app/api/cdek/route.js
import { NextResponse } from "next/server";

const baseUrl = "https://api.cdek.ru/v2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const requestData: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key !== "action") {
        requestData[key] = value;
      }
    });

    if (!action) {
      return sendValidationError("Action is required");
    }

    const authToken = await getAuthToken();

    let responseData;
    let responseHeaders = {};

    switch (action) {
      case "offices":
        [responseData, responseHeaders] = await getOffices(authToken, requestData);
        break;
      case "calculate":
        [responseData, responseHeaders] = await calculate(authToken, requestData);
        break;
      default:
        return sendValidationError("Unknown action");
    }

    return sendResponse(responseData, responseHeaders);
  } catch (error: any) {
    console.error("🛑 Error occurred:", error);
    return sendValidationError(error.message);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action;
    const requestData = body;

    if (!action) {
      return sendValidationError("Action is required");
    }

    const authToken = await getAuthToken();

    let responseData;
    let responseHeaders = {};

    switch (action) {
      case "offices":
        [responseData, responseHeaders] = await getOffices(authToken, requestData);
        break;
      case "calculate":
        [responseData, responseHeaders] = await calculate(authToken, requestData);
        break;
      default:
        return sendValidationError("Unknown action");
    }

    return sendResponse(responseData, responseHeaders);
  } catch (error: any) {
    console.error("🛑 Error occurred:", error);
    return sendValidationError(error.message);
  }
}

async function getAuthToken() {
  const CDEK_LOGIN = process.env.CDEK_ACCOUNT_IDENTIFIER;
  const CDEK_SECRET = process.env.CDEK_SECRET;

  const response = await fetch(`${baseUrl}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: CDEK_LOGIN as string,
      client_secret: CDEK_SECRET as string,
    }),
  });

  const result = await response.json();

  if (!result.access_token) {
    throw new Error("Server not authorized to CDEK API");
  }

  return result.access_token;
}

async function getOffices(authToken: any, requestData: any) {
  const params = {
    page: requestData.page || 0,
    size: requestData.size || 100,
    is_handout: requestData.is_handout !== undefined ? requestData.is_handout : true,
    ...requestData,
  };

  return await httpRequest("deliverypoints", authToken, params);
}

async function calculate(authToken: any, requestData: any) {
  return await httpRequest("calculator/tarifflist", authToken, requestData, true);
}

async function httpRequest(method: any, authToken: any, data: any, useJson = false) {
  const url = useJson ? `${baseUrl}/${method}` : `${baseUrl}/${method}?${new URLSearchParams(data)}`;
  // console.log("🟢 HTTP request to URL:", url);

  const options = {
    method: useJson ? "POST" : "GET",
    headers: {
      Accept: "application/json",
      "X-App-Name": "widget_pvz",
      Authorization: `Bearer ${authToken}`,
      ...(useJson && { "Content-Type": "application/json" }),
    },
    ...(useJson && { body: JSON.stringify(data) }),
  };

  const response = await fetch(url, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  const responseHeaders: Record<string, any> = {};
  response.headers.forEach((value, name) => {
    if (name.startsWith("x-")) {
      responseHeaders[name] = value;
    }
  });

  return [result, responseHeaders];
}

function sendResponse(data: any, headers: any) {
  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "X-Service-Version": "3.10.2",
      ...headers,
    },
  });
}

function sendValidationError(message: any) {
  return NextResponse.json(
    { message },
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "X-Service-Version": "3.10.2",
      },
    },
  );
}
