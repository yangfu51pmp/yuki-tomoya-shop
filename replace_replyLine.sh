# replace all occurrences of `replyLine(` with `replyLine(` and appending `targetId, startTime` at the end
# but wait, replyLine has arguments: replyToken, text, imageUrl
# We can use regex to replace all `await replyLine(replyToken, ..., ...);`
# But it might be multi-line.
