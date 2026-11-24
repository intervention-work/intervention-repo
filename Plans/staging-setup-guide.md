# Staging setup guide (one-time, manual steps)

Do these once. About 15 minutes. Needs: AWS Console access, GitHub admin on `Karooli-ai/intervention-repo`.

## A. Create the staging app in AWS Amplify

1. AWS Console, region **US East (N. Virginia)**, open **AWS Amplify**.
2. Click **Create new app**, choose **GitHub**, click **Next**.
3. Authorize GitHub if asked. Pick repository **Karooli-ai/intervention-repo**, branch **staging**. Next.
4. App name: `intervention-staging`. Leave the build settings as detected (it uses `amplify.yml`). Next.
5. Expand **Advanced settings** and add the environment variables:
   - `NEXT_PUBLIC_WP_API_URL` = `https://interventions.wpenginepowered.com/wp-json`
   - `NEXT_PUBLIC_SITE_ENV` = `staging`
   - `NEXT_REVALIDATE_SECONDS` = `3600`
   - `REVALIDATE_SECRET` = any new random string (not the production one)
6. Click **Next**, then **Save and deploy**. Wait for the build to go green (about 5 to 8 minutes).
7. Copy the app URL (`https://staging.<id>.amplifyapp.com`). Go to **Hosting > Environment variables**, add `NEXT_PUBLIC_SITE_URL` = that URL, then **Redeploy this version**.

## B. Check it

1. Open the staging URL. The site should load with real content.
2. Open `<staging-url>/robots.txt`. It must say `Disallow: /`.
3. (Optional) Amplify **Access control**: turn on a username and password so only reviewers can open it.

## C. Protect `main` in GitHub (both repos)

Repo, **Settings > Branches > Add branch protection rule**, pattern `main`:
- Require a pull request before merging.
- Require status checks: select **from-staging-only**.
- Block force pushes. Do not allow deletions.

Add the same rule for `staging`: block deletions and force pushes (this keeps it "always present").

## D. Tell the team

Share `Plans/staging-workflow.md`. Rule: push to `staging`, review on the staging URL, PR `staging` -> `main`.

## Optional: custom domain

Amplify app `intervention-staging` > **Hosting > Custom domains**, add `staging.intervention.com`, then add the CNAME records Amplify shows at the DNS provider.
