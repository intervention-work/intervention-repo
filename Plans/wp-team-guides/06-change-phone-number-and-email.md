# Guide 06: Change the Phone Number and Email

**Use this when:** you want to update the phone number or email address that appears across the whole website (in the header, footer, and contact areas).

You only change this in ONE place. The website updates it everywhere automatically.

## Where to go

1. Log in: **https://interventiodev.wpenginepowered.com/wp-admin/**
2. In the left menu, click **Global Settings**.
3. Direct link: **https://interventiodev.wpenginepowered.com/wp-admin/admin.php?page=global-settings**

## Steps

1. You will see boxes for the phone number and email.
   - **Phone (display)**: how the number looks to visitors, for example `(800) 789-1605`.
   - **Phone (link)**: the number used when someone taps to call, written as `tel:+18007891605` (no spaces, with country code).
   - **Email**: the contact email address.
2. Change the values you need.
3. Click the blue **Update** button (or "Save Changes").

## When will I see it on the live site?

About 1 minute. Because this affects the header and footer on every page, refresh any page and you will see the new number and email site-wide.

## Watch out

- Keep the two phone fields matching. If the display shows `(800) 789-1605`, the link field should be `tel:+18007891605` (the same digits, no spaces or brackets, with `+1` in front).
- Do not touch the "Revalidation" boxes on this page. Those are technical settings that keep the live site connected. Changing them can stop your edits from appearing. If they ever look empty or wrong, tell the developer.
