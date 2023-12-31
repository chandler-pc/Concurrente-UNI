package com.concurrente.pc2;

import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.BitmapFont;
import com.badlogic.gdx.graphics.g2d.Sprite;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.graphics.glutils.ShapeRenderer;
import com.badlogic.gdx.math.Vector2;
import com.badlogic.gdx.physics.box2d.*;

import java.io.*;
import java.net.Socket;

public class Chopper{
    private Sprite sprite;
    private int money;
    private int energy;
    private int index;
    private final boolean isDebug;
    private ShapeRenderer shapeRenderer;
    private OutputStream out;
    private boolean bIsActive;
    private Body naveBody;
    private BitmapFont font = new BitmapFont();
    public boolean bCanDraw = true;
    public Chopper(int index,float x, float y,boolean isDebug, World world){
        this.bIsActive = true;
        this.index = index;
        this.isDebug = isDebug;
        Texture texture = new Texture("chopper.png");
        this.sprite = new Sprite(texture);
        this.sprite.setScale(0.1f);
        this.money = 0;
        this.energy = 40;
        float scale = .7f;
        sprite.setSize(sprite.getWidth() * scale, sprite.getHeight() * scale);
        sprite.setScale(scale);
        sprite.setPosition(x, y);
        sprite.setOrigin(sprite.getWidth() / 2, sprite.getHeight() / 2);
        if (this.isDebug) {
            shapeRenderer = new ShapeRenderer();
        }
        PolygonShape shape = new PolygonShape();
        shape.setAsBox(sprite.getWidth() / 3, sprite.getHeight() / 4);
        BodyDef bodyDef = new BodyDef();
        bodyDef.type = BodyDef.BodyType.DynamicBody;
        bodyDef.position.set(x, y);
        bodyDef.fixedRotation = true;
        naveBody = world.createBody(bodyDef);
        FixtureDef fixtureDef = new FixtureDef();
        fixtureDef.shape = shape;
        fixtureDef.density = 1000f;
        fixtureDef.friction = 1.0f;
        fixtureDef.restitution = 0f;
        naveBody.createFixture(fixtureDef);
        naveBody.setUserData(this);

        shape.dispose();
    }
    public void draw(SpriteBatch batch, World world) {
        if (!bCanDraw){
            if(naveBody != null){
                naveBody.setTransform(5000,5000,0);
            }
            return;
        }
        if (!bIsActive){
            if (naveBody != null){
                world.destroyBody(naveBody);
                naveBody = null;
            }
            return;
        }
        font.draw(batch, "Energy: " + energy, sprite.getX() + 15 , sprite.getY() + sprite.getHeight());
        sprite.draw(batch);
        sprite.setPosition(naveBody.getPosition().x - sprite.getWidth()/2, naveBody.getPosition().y - sprite.getHeight()/2);
    }
    public void setActive(boolean bIsActive){
        this.bIsActive = bIsActive;
    }
    public void forceMove(float desiredVelX, float desiredVelY){
        if(!bIsActive){
            return;
        }
        if (naveBody == null){
            return;
        }
        Vector2 vel = naveBody.getLinearVelocity();
        float velChangeX = desiredVelX - vel.x;
        float velChangeY = desiredVelY - vel.y;
        float impulseX = naveBody.getMass() * velChangeX;
        float impulseY = naveBody.getMass() * velChangeY;
        if(desiredVelX < 0){
            sprite.setRotation(180);
        }else if (desiredVelX > 0){
            sprite.setRotation(0);
        }
        naveBody.applyLinearImpulse(impulseX, impulseY, naveBody.getWorldCenter().x, naveBody.getWorldCenter().y, true);
    }
    public void stopMove(){
        if (naveBody == null){
            return;
        }
        naveBody.setLinearVelocity(0,0);
    }
    public void translate(float dx, float dy){
        if (!bIsActive){
            return;
        }
        if (naveBody == null){
            return;
        }
        naveBody.setTransform(dx + sprite.getWidth()/2, dy + sprite.getHeight()/2, 0);
    }

    public void debugMode() {
        if (isDebug) {
            shapeRenderer.begin(ShapeRenderer.ShapeType.Line);
            shapeRenderer.rect(sprite.getBoundingRectangle().x, sprite.getBoundingRectangle().y+10, sprite.getBoundingRectangle().width, sprite.getBoundingRectangle().height-20);
            shapeRenderer.end();
        }
    }

    public void dispose() {
        sprite.getTexture().dispose();
    }
    public float getX() {
        return sprite.getX();
    }
    public float getY() {
        return sprite.getY();
    }

    public void sendData(Socket clientSocket) throws IOException {
        out = clientSocket.getOutputStream();
        String data = getIndex() + "," + getX() + "," + getY() + "," + sprite.getRotation() + "," + getEnergy() + "," + getMoney() + "," + bCanDraw;
        out.write("update".getBytes());
        out.write(data.getBytes());
        out.flush();
    }
    public void sendDisconnect(Socket clientSocket) throws IOException {
        out = clientSocket.getOutputStream();
        String data = getIndex() + "";
        out.write("disconnect".getBytes());
        out.write(data.getBytes());
        out.flush();
    }

    public int getMoney() {
        return money;
    }
    public int getEnergy() {
        return energy;
    }
    public int getIndex(){
        return index;
    }
    public void setRotation(float rotation){
        this.sprite.setRotation(rotation);
    }
    public void sendBullet(Socket bulletsSocket){
        if (naveBody == null){
            return;
        }
        OutputStream outputStream;
        try {
            outputStream = bulletsSocket.getOutputStream();
            int direction = 1;
            if (sprite.getRotation() == 180){
                direction = -1;
            }
            String data = getIndex() + "," + (naveBody.getPosition().x + 70*direction) + "," + naveBody.getPosition().y + "," + sprite.getRotation() + "," + 8000;
            outputStream.write(data.getBytes());
            outputStream.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    public void makeDamage(int damage){
        this.energy -= damage;
    }
    public void setEnergy(int energy){
        this.energy = energy;
    }
    public void setMoney(int money){
        this.money = money;
    }
    public void setbCanDraw(boolean bCanDraw){
        this.bCanDraw = bCanDraw;
    }
}
