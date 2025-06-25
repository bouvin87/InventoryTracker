import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { hashPassword, comparePasswords } from "./password-utils";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'development-secret-key-12345',
    resave: true, // Ändrat till true för bättre sessionhantering
    saveUninitialized: true, // Ändrat till true för att säkerställa sessionsskapande
    store: storage.sessionStore,
    rolling: true, // Förnya sessionstiden vid varje request
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 vecka
      secure: false, // Alltid false för lokal utveckling
      httpOnly: true,
      sameSite: 'lax'
    }
  };

  // Enklare konfiguration för lokal utveckling
  if (process.env.NODE_ENV === 'production') {
    app.set("trust proxy", 1);
  }
  
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Debug sessionhantering endast för inloggningsrelaterade routes
  app.use('/api/login', (req, res, next) => {
    console.log('Login attempt - Session ID:', req.sessionID);
    console.log('User authenticated before login:', req.isAuthenticated());
    next();
  });
  
  app.use('/api/user', (req, res, next) => {
    console.log('User check - Session ID:', req.sessionID);
    console.log('User authenticated:', req.isAuthenticated());
    if (req.user) console.log('Current user:', req.user.name);
    next();
  });

  passport.use(
    new LocalStrategy({
      // Ignorera lösenordsfältet
      passReqToCallback: true,
      passwordField: '__no_password__'
    }, async (req, username, _password, done) => {
      try {
        console.log(`Väljer användare: ${username}`);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log(`Användaren "${username}" hittades inte`);
          return done(null, false, { message: 'Användaren kunde inte hittas' });
        }
        
        // Godkänn användaren direkt utan lösenordskontroll
        console.log(`Användare vald: ${user.name} (${user.role})`);
        return done(null, user);
      } catch (error) {
        console.error(`Fel vid användarval: ${error}`);
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Användarnamnet finns redan");
      }

      // Hash lösenordet innan det sparas
      const hashedPassword = await hashPassword(req.body.password);

      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  // Logga in med användarnamn (för dropdown)
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message?: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || 'Användaren hittades inte' });
      
      req.login(user, (err: any) => {
        if (err) return next(err);
        
        // Spara sessionen explicit
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return next(saveErr);
          }
          
          console.log(`User ${user.name} logged in successfully via username, session saved`);
          res.status(200).json(user);
        });
      });
    })(req, res, next);
  });
  
  // Logga in direkt med användar-ID (för enkel inloggning utan lösenord)
  app.post("/api/login/user/:id", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.log(`User with ID ${userId} not found`);
        return res.status(404).json({ message: "Användaren hittades inte" });
      }
      
      // Säkerställ att sessionen sparas
      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        
        // Spara sessionen explicit
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("Session save error:", saveErr);
            return next(saveErr);
          }
          
          console.log(`User ${user.name} logged in successfully, session saved`);
          res.status(200).json(user);
        });
      });
    } catch (error) {
      console.error("Error in direct login:", error);
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: any) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}