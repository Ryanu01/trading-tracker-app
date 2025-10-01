import { Watchlist } from "@/database/models/watchlist.model";
import { connectToDatabase } from "@/database/mongoose";

export async function getWatchListSymbolByEmail(email: string): Promise<string[]> {
  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if(!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{_id?: unknown, id? : string, email? : string}>({email});

    if(!user) return [];

    const userId = (user.id as string) || String(user.id || '');
    if(!userId) return [];

    const items = await Watchlist.find( { userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (error) {
    console.error('getWatchListByEmail error: ', error);
    return [];
  }  
}