const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-musing.nyusoft.in';

export async function fetchHealth() {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch health status:', error);
    return { status: 'error', message: 'Backend is unreachable' };
  }
}

export async function fetchRoutes() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/user/auth/routes`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to fetch routes:', error);
    return [];
  }
}

export async function executeApiCall(method: string, path: string, body: any, headers: any) {
  try {
    const options: RequestInit = {
      method,
      headers: { ...headers },
    };

    if (body) {
      if (Array.isArray(body)) {
        // Mock multipart/form-data for demo
        const formData = new FormData();
        body.forEach(item => {
          if (item.type === 'file') {
            // In a real app, this would be a file object from an input
            formData.append(item.key, new Blob(['mock file content'], { type: 'text/plain' }));
          } else {
            formData.append(item.key, item.value);
          }
        });
        options.body = formData;
        // Don't set Content-Type header for FormData, browser does it automatically with boundary
        if (options.headers) {
          delete (options.headers as any)['Content-Type'];
        }
      } else {
        options.body = JSON.stringify(body);
        if (options.headers) {
          (options.headers as any)['Content-Type'] = 'application/json';
        }
      }
    }

    const response = await fetch(`${BASE_URL}${path}`, options);
    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      status: response.status,
      statusText: response.statusText,
      data
    };
  } catch (error: any) {
    console.error('API Execution failed:', error);
    return {
      status: 0,
      statusText: 'Error',
      data: error.message
    };
  }
}
