# Slack Integration Troubleshooting

## Common Issues and Solutions

### 1. "missing_scope" Error

**Error Message:**
```
ERROR: Slack API error when joining channel
slackError: "missing_scope"
```

**Root Cause:**
The Slack bot lacks the `channels:join` permission, which is required for the bot to automatically join channels when posting messages.

**Required Scopes:**
- `chat:write` - allows posting messages
- `channels:read` - allows reading channel information  
- `channels:join` - allows the bot to join channels automatically

**Solution:**
1. **Option A: Update Environment Variables (Recommended)**
   ```bash
   SLACK_SCOPES=chat:write,channels:read,channels:join
   ```

2. **Option B: Reconnect Integration**
   - Go to Settings → Integrations
   - Disconnect Slack integration
   - Reconnect Slack integration
   - This will request the updated permissions

3. **Option C: Manual Channel Invite**
   - Manually invite `@WhizBoard Bot` to the channel
   - The bot can then post messages without needing to join automatically

### 2. "not_in_channel" Error

**Error Message:**
```
ERROR: Bot not in channel, attempting to join automatically
```

**Root Cause:**
The bot is not a member of the target channel and needs to join to post messages.

**Solution:**
- The bot will automatically attempt to join the channel
- If successful, the message will be posted
- If unsuccessful (due to missing permissions), see the "missing_scope" solution above

### 3. Private Channel Access

**Issue:**
Bot cannot access private channels without being explicitly invited.

**Solution:**
- Manually invite `@WhizBoard Bot` to private channels
- The bot will then be able to post messages to those channels

## Prevention

1. **Ensure Proper Scopes:** Always include `channels:join` in your Slack app configuration
2. **Test Permissions:** Use the permission check feature in Settings to verify bot permissions
3. **Monitor Logs:** Check application logs for Slack API errors
4. **Regular Reconnection:** Periodically reconnect integrations to refresh permissions

## Environment Variables

```bash
# Required for proper functionality
SLACK_CLIENT_ID=your_client_id
SLACK_CLIENT_SECRET=your_client_secret
SLACK_SCOPES=chat:write,channels:read,channels:join

# Optional - will use defaults if not set
# Default scopes: chat:write,channels:read,channels:join
```

## Testing

1. **Permission Check:** Visit Settings → Integrations → Slack to check bot permissions
2. **Channel Test:** Try posting a message to a channel to test functionality
3. **Error Monitoring:** Check application logs for any Slack API errors

## Support

If issues persist after trying these solutions:
1. Check the application logs for detailed error messages
2. Verify your Slack app configuration in the Slack Developer Console
3. Ensure your Slack app has the correct OAuth scopes configured
