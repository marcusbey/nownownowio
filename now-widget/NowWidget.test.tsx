import { generateWidgetToken } from "@/lib/widget/widgetUtils";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NowWidget from "./NowWidget";

// Mock the fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("NowWidget", () => {
  const mockProps = {
    userId: "testUser",
    token: "testToken",
    theme: "light" as const,
    position: "right" as const,
    buttonColor: "red",
    buttonSize: 150,
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("Rendering", () => {
    it("renders NowButton", () => {
      render(<NowWidget {...mockProps} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("applies correct theme and position", () => {
      render(<NowWidget {...mockProps} />);
      expect(document.body).toHaveAttribute("data-widget-theme", "light");
      expect(document.body).toHaveAttribute("data-widget-position", "right");
    });
  });

  describe("Interaction", () => {
    it("opens side panel on button click", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: { recentPosts: [] } }),
      });

      render(<NowWidget {...mockProps} />);
      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(await screen.findByText("Loading...")).toBeInTheDocument();
    });

    it("closes side panel when close button is clicked", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: { recentPosts: [] } }),
      });

      render(<NowWidget {...mockProps} />);
      const openButton = screen.getByRole("button");
      await userEvent.click(openButton);

      const closeButton = await screen.findByText("×");
      await userEvent.click(closeButton);
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  describe("Data Fetching", () => {
    test("fetches and displays posts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              recentPosts: [
                {
                  id: "1",
                  content: "Test post",
                  createdAt: "2023-01-01T00:00:00Z",
                },
              ],
            },
          }),
      });

      render(<NowWidget {...mockProps} />);
      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(await screen.findByText("Test post")).toBeInTheDocument();
    });

    test("displays error message on fetch failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Fetch failed"));

      render(<NowWidget {...mockProps} />);
      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(await screen.findByText(/Error:/)).toBeInTheDocument();
    });

    test("displays no posts message when no posts are available", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            data: {
              recentPosts: [],
            },
          }),
      });

      render(<NowWidget {...mockProps} />);
      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(
        await screen.findByText("No posts available."),
      ).toBeInTheDocument();
    });
  });
});

describe("Widget Integration Test", () => {
  const userId = "testUser123";
  let token: string;

  beforeAll(() => {
    token = generateWidgetToken(userId);
  });

  it("Generate widget script", async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/widget/generate-script?userId=${userId}`,
    );
    const data = await response.json();
    expect(data.script).toBeDefined();
    expect(data.script).toContain(userId);
    expect(data.script).toContain("NOW_WIDGET_CONFIG");
  });

  it("Fetch user data with valid token", async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/widget/user-data`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.user).toBeDefined();
    expect(data.data.recentPosts).toBeDefined();
  });

  it("Reject request with invalid token", async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/widget/user-data`,
      {
        headers: {
          Authorization: "Bearer invalidtoken",
        },
      },
    );
    expect(response.status).toBe(401);
  });
});
