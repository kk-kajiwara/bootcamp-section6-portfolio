// section6-1-6-5_Front/src/app/contact/page.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// 動的 import（Next の "use client" コンポーネント）
import Contact from "./page";

describe("Contact page", () => {
  beforeEach(() => {
    // fetch をテストごとにモック
    (global as any).fetch = vi.fn();
  });

  it("必須未入力はエラーメッセージ（異常系）", async () => {
    render(<Contact />);
    await userEvent.click(screen.getByRole("button", { name: "送信" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "お名前を入力してください"
    );
  });

  it("ハニーポットを埋めたらエラー（異常系）", async () => {
    render(<Contact />);

    // 先に必須項目を埋めて、通常バリデーションを通過させる
    await userEvent.type(screen.getByPlaceholderText("お名前"), "kazue");
    await userEvent.type(
      screen.getByPlaceholderText("メールアドレス"),
      "k@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("メッセージ"), "hi");

    // hidden だが DOM には存在。React の onChange を発火させる必要がある
    const honeypot = document.querySelector(
      'input[name="company"]'
    ) as HTMLInputElement;

    // 直接 value を代入するだけでは React state が更新されないので、
    // fireEvent.input で onChange を発火させる
    fireEvent.input(honeypot, { target: { value: "bot" } });

    await userEvent.click(screen.getByRole("button", { name: "送信" }));

    // メッセージは実装上「送信に失敗しました。再度お試しください。」なので部分一致
    expect(screen.getByRole("alert")).toHaveTextContent(/送信に失敗しました/);
  });

  it("送信成功で完了画面（正常系）", async () => {
    (global as any).fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });
    render(<Contact />);
    await userEvent.type(screen.getByPlaceholderText("お名前"), "kazue");
    await userEvent.type(
      screen.getByPlaceholderText("メールアドレス"),
      "k@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("メッセージ"), "hi");
    await userEvent.click(screen.getByRole("button", { name: "送信" }));
    expect(await screen.findByText("送信しました！")).toBeInTheDocument();
  });

  it("送信失敗でエラー表示（異常系）", async () => {
    (global as any).fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "bad",
    });
    render(<Contact />);
    await userEvent.type(screen.getByPlaceholderText("お名前"), "kazue");
    await userEvent.type(
      screen.getByPlaceholderText("メールアドレス"),
      "k@example.com"
    );
    await userEvent.type(screen.getByPlaceholderText("メッセージ"), "hi");
    await userEvent.click(screen.getByRole("button", { name: "送信" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "送信に失敗しました"
    );
  });
});
