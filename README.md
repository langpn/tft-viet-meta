# TFT Việt Meta

Cẩm nang Đấu Trường Chân Lý bằng tiếng Việt, gồm bảng xếp hạng đội hình, trang bị, lõi nâng cấp và thống kê Explorer. Trang đang phục vụ bộ dữ liệu Mùa 18, bản 18.5c. [Website](https://tft.langpn.xyz)

## Chạy hệ thống

Dùng Bun 1.4.3 cho cài đặt, đồng bộ và test. Ứng dụng SvelteKit chạy production trên Node.js 22.17 trở lên. Docker và CI dùng Node.js 24.

```bash
bun install --frozen-lockfile
bun run dev
```

Trang phát triển mở tại `http://localhost:3000`. Để kiểm tra bản production, chạy `bun run build` rồi `bun run start`.

```bash
bun run verify
bun test
bun run typecheck
bun run build
```

## Đồng bộ dữ liệu

`bun run sync` chạy từ thư mục gốc. Lệnh tải các nguồn, dựng JSON và tooltip trong thư mục tạm, áp dụng bản dịch đã duyệt, kiểm tra fixture Explorer rồi cập nhật bộ dữ liệu cùng manifest. CI chạy lại verify, test, kiểm tra kiểu và build trước khi đẩy cập nhật. `bun run verify` có thể chạy offline. Lệnh đối chiếu hash các tệp đã phát hành và các truy vấn Explorer có fixture.

Nếu nguồn lệch mùa, thiếu dữ liệu hoặc thiếu bản dịch coaching, lệnh thoát với mã `2` và giữ bộ dữ liệu đã phát hành. Hiện trang giới thiệu mùa của TFT Academy đã chuyển sang Set 19 nên nguồn này chặn đồng bộ Set 18. [Manifest](src/lib/data/meta-manifest.json)

Nếu tiến trình cập nhật bị dừng đột ngột, kiểm tra PID trong `src/lib/data/.meta-publish-lock/owner.json` và chạy `bun run verify`. Nếu hash bị lệch, dùng các bản `previous` trong `.meta-stage-*` để khôi phục bộ dữ liệu theo manifest trước khi xác minh lại. Chỉ xóa khóa khi tiến trình đã dừng và bộ dữ liệu đã được xác minh.

Để bổ sung coaching đã duyệt, dùng `bun run sync --coaching path/to/translations.json`. Tệp JSON là một mảng có `id` đội hình, `tips` gồm các trường `stage`, `tip_en`, `tip`, và hai trường `augmentsTip_en`, `augmentsTip`. Các chuỗi tiếng Anh phải khớp với nguồn. Bản dịch mới được kiểm tra số liệu trước khi dùng. Nếu chỉ bổ sung mẹo theo giai đoạn, để hai trường dành cho lõi là chuỗi rỗng.

`scripts/build-tooltip-db.ts`, `scripts/build-official-vi.ts` và `scripts/apply-official-vi.ts` nhận đường dẫn thư mục staging. Lệnh sync dùng overlay tiếng Việt đã kiểm tra hash trong manifest. Script tạo overlay cho phép chuẩn bị bản mới để rà trước khi cập nhật dữ liệu nguồn. [Nguồn và xuất xứ](docs/source-attribution.md) · [Quy tắc đối chiếu](docs/parity-contract.md)
