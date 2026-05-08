import express from "express";
import mongoose from "mongoose";
import Category from "@/model/Category.js";

const categoriesRouter = express.Router();


categoriesRouter.post("/", async (req, res, next) => {
    if (!req.body.title || req.body.title.trim() === '') {
        return res.status(400).send({error: 'Title is required'});
    }

    try {
        const newCategory = new Category({title: req.body.title});
        await newCategory.save();
        return res.send(newCategory);
    } catch(e) {
        if (e instanceof mongoose.Error.ValidationError) {
            return res.status(400).send({
                error_code: "VALIDATION_ERROR",
                details: e.errors,
            });
        }
        next(e);
    }
});

categoriesRouter.get('/', async (req, res, next) => {
    const result = await Category.find();
    return res.send(result);
});


categoriesRouter.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  const isValidId = mongoose.Types.ObjectId.isValid(id);

  if (!id || !isValidId) {
    return res.status(400).send({ error: 'Invalid ID' });
  }

  try {
    const category = await Category.findById(id);
    if (!category) return res.status(400).send({error: 'Category not found'});

    category.isPublished = true;
    await category.save();

  } catch (e) {
    console.log(e);
    return res.status(400).send({ error: 'Cant delete category' });
  }
});

categoriesRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  const isValidId = mongoose.Types.ObjectId.isValid(id);

  if (!id || !isValidId) {
    return res.status(400).send({ error: 'Invalid ID' });
  }

  try {
    await Category.deleteOne({_id: id});
  } catch(e) {
    console.log(e);
    return res.status(400).send({error: 'Cant delete category'});
  }
});