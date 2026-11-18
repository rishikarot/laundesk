# Laundry Desk — How to Use

This guide is written for day-to-day laundry staff. Use the app on a phone, tablet or desktop browser.

## 1. Sign in

Open Laundry Desk. Enter your login/mobile number and your six-digit code. You do not choose a role; the system opens the correct workspace automatically.

Demo accounts:

| User | Login | Code |
|---|---|---:|
| Admin | `admin` | `111111` |
| Manager | `manager` | `222222` |
| Delivery | `driver` | `333333` |
| Customer | `+971501234567` | `444444` |

## 2. Admin

Use **Admin** for setup, not for daily laundry work.

### Staff

Go to **Admin → Staff**. Add Admin, Manager or Delivery users. Enter a six-digit code or leave it blank and Laundry Desk generates one and shows it once. Use **Edit** to change role, phone, login or disable the account.

### Customers

Go to **Admin → Customers**. You can enable/disable customer app access and reset a customer's six-digit code. After a reset, the new code is shown immediately; share it privately.

### Garments and services

Go to **Admin → Catalog**. Add or edit garment types such as Shirt, Trouser or Abaya. Add/edit services such as **Wash + Iron** and **Iron Only**. Turn an item off instead of deleting it when it should no longer be offered.

### Rates and discounts

Go to **Admin → Rates** to set the AED price for a garment + service combination. Rates have an effective date. Go to **Discounts** to maintain percentage/fixed discounts.

### Reports

Go to **Reports** for active orders, outstanding money, payments received, customer credit and stage counts.

## 3. Manager — counter customer

1. Tap **New → Counter order**.
2. Choose the customer.
3. Choose **Wash + Iron** or **Iron Only**.
4. Tap `+` next to each garment until the correct quantity is shown.
5. Choose a discount only if applicable.
6. If the customer pays now, enter the amount and payment method. Otherwise leave it blank.
7. Tap **Create Order**.

The order starts at **Received**. An Iron Only order automatically skips Washing later.

## 4. Manager — WhatsApp/phone pickup request

1. Tap **New → Pickup request**.
2. Select the customer.
3. Assign a Delivery user now, or assign later.
4. Add any useful address/time note.
5. Save.

The order is now **Pickup requested** and appears to the assigned Delivery user.

## 5. Delivery — doorstep pickup

1. Sign in as Delivery and open **Stops**.
2. Under **Pickup stops**, open the assigned customer.
3. Tap **Collect garments**.
4. Choose Wash + Iron or Iron Only.
5. Tap `+ / −` to capture garments and quantities.
6. Enter any payment collected at the door, or leave it blank.
7. Tap **Save + Collect**.

The price is calculated by the server from the configured rate card. The Delivery user cannot manually override the price.

## 6. Manager — laundry processing

Open the order and use the primary next-stage button.

Normal order:

`Collected → Received → Washing → Ironing → Ready`

Iron Only:

`Collected/Received → Ironing → Ready`

When a pickup order becomes Ready, assign a Delivery user. Then move it to **Out for delivery**.

For a counter order, after **Ready** you can hand it directly to the customer and mark it **Delivered** without creating a delivery stop.

## 7. Delivery — handover

1. Open **Stops → Delivery stops**.
2. Open the order.
3. Tap **Deliver / Take Payment**.
4. Enter the payment actually received, or enter 0/leave blank when already paid.
5. Tap **Confirm Handover**.

Laundry Desk marks the laundry **Delivered**. Payment can still remain partial/outstanding because laundry status and payment status are separate.

## 8. Payments and customer credit

Manager/Admin can open any order and tap **Record payment**.

If an order is AED 25 and the customer gives AED 30:

- AED 25 is applied to that order.
- AED 5 becomes customer credit.

On the next unpaid order, open it and tap **Apply AED 5.00 credit**. Laundry Desk applies only the amount needed and keeps any remaining credit for later.

## 9. Receipt, PDF, QR and WhatsApp

Open an order:

- **Receipt / PDF** opens the print layout with the order QR. Choose **Save as PDF** in the browser print dialog.
- **Bag + garment tags** prints a bag label with the order QR plus individual tags containing Order ID, Customer Code and Piece Number.
- **WhatsApp** opens the customer's chat with an order/status/payment message already filled. Attach the saved receipt PDF before sending.

## 10. Customer

A customer signs in using their UAE mobile number + six-digit code. They can:

- request a pickup,
- see only their own orders,
- see laundry status and payment status,
- see totals, paid amount, outstanding balance and available credit,
- open receipt/order details.

They cannot see another customer's data.

## 11. If something looks wrong

Do not create duplicate payments to “fix” a screen value. Refresh first. If the database amount is wrong, stop the transaction and let the Manager/Admin investigate. For a live pilot, keep one responsible person for rate changes and financial corrections.


## Change the theme color

1. Sign in.
2. Tap the **palette** button in the top-right header. On Delivery/Customer accounts you can also open **Account → Change theme**.
3. Choose one of the preset colors, or select a custom color.
4. Tap **Save theme**.
5. The choice is remembered on that device/browser. It only changes appearance; orders, payments and workflow data are unaffected.
