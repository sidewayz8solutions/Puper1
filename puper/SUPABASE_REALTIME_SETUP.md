# Supabase Real-time Setup Guide

## 🚀 Enable Real-time for Püper App

Real-time functionality is **essential** for the Püper app to show live restroom updates. Here's how to enable it:

### Step 1: Enable Real-time in Supabase Dashboard

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/qunaiicjcelvdunluwqh
2. **Navigate to Settings** → **API** 
3. **Scroll down to "Real-time" section**
4. **Enable Real-time** if it's not already enabled
5. **Save changes**

### Step 2: Enable Real-time for Restrooms Table

1. **Go to Database** → **Replication**
2. **Find the `restrooms` table**
3. **Toggle ON** the real-time replication for this table
4. **Click "Save"**

### Step 3: Check Row Level Security (RLS)

Real-time respects RLS policies. Make sure your `restrooms` table has proper policies:

```sql
-- Allow public read access for real-time
CREATE POLICY "Allow public read access" ON restrooms
FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON restrooms
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Step 4: Test Real-time Connection

1. **Visit**: http://localhost:3000/test
2. **Check the "Supabase Real-time" test**
3. **Should show**: ✅ Real-time subscription active!

### Step 5: Test Live Updates

1. **Open two browser windows** with the map page
2. **Add a restroom** in one window
3. **Watch it appear instantly** in the other window

## 🔧 Troubleshooting

### If Real-time is Not Working:

1. **Check Supabase Plan**: Real-time is available on all plans including free tier
2. **Verify Table Replication**: Ensure `restrooms` table has replication enabled
3. **Check RLS Policies**: Make sure policies allow the operations you need
4. **Browser Console**: Look for real-time connection errors
5. **Network**: Check if WebSocket connections are blocked

### Common Issues:

- **"CHANNEL_ERROR"**: Real-time not enabled for the table
- **"CLOSED"**: Connection lost, usually network related
- **No updates**: RLS policies might be blocking the subscription

### Real-time Status Indicators:

- 🟢 **REALTIME**: Connected and receiving live updates
- 🟡 **CONNECTING**: Establishing connection
- 🔴 **ERROR**: Connection failed
- ⚪ **DISCONNECTED**: Connection lost

## 📊 What Real-time Enables:

- ✅ **Live restroom additions**: See new restrooms instantly
- ✅ **Live updates**: Rating changes, edits appear immediately  
- ✅ **Live statistics**: User count and stats update in real-time
- ✅ **Collaborative experience**: Multiple users see each other's changes

## 🎯 Expected Behavior:

When working correctly:
1. **Map page shows**: "REALTIME" status in search panel
2. **Adding restrooms**: Appears on all connected users' maps instantly
3. **Statistics update**: Live user count and restroom stats
4. **No page refresh needed**: Everything updates automatically

## 🆘 Need Help?

If real-time still doesn't work after following these steps:

1. **Check the test page**: `/test` for detailed diagnostics
2. **Browser console**: Look for WebSocket or Supabase errors
3. **Supabase logs**: Check your project logs in the dashboard
4. **Contact support**: Supabase has excellent support for real-time issues

Real-time is crucial for the collaborative nature of Püper - users need to see new restrooms immediately!
