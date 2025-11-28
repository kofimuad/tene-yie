// src/controllers/workflowController.js
// Controllers contain the business logic for your routes
// Think of it as: Route receives request → Controller processes it → Returns response

import { v4 as uuidv4 } from 'uuid';
import supabase from '../utils/supabaseClient.js'; // FIX 1: Added .js extension

// ========== CREATE WORKFLOW ==========
// POST /api/workflows
export async function createWorkflow(req, res) {
  try {
    // req.body contains data sent from the frontend
    const { name, description } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Workflow name is required' });
    }

    // Insert new workflow into Supabase
    // FIX 2: Changed from() to supabase.from()
    const { data, error } = await supabase
      .from('workflows')
      .insert([{
        id: uuidv4(),           // Generate unique ID
        name,
        description: description || '',
        enabled: true
      }])
      .select();                // Return the created workflow

    // Check if there was an error
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Success! Return the created workflow
    res.status(201).json({
      message: 'Workflow created successfully',
      workflow: data[0]
    });
  } catch (err) {
    console.error('Error creating workflow:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ========== GET ALL WORKFLOWS ==========
// GET /api/workflows
export async function getAllWorkflows(req, res) {
  try {
    // Fetch all workflows from database
    const { data, error } = await supabase
      .from('workflows')
      .select('*')              // Select all columns
      .order('created_at', { ascending: false }); // Newest first

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      workflows: data,
      count: data.length
    });
  } catch (err) {
    console.error('Error fetching workflows:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ========== GET SINGLE WORKFLOW ==========
// GET /api/workflows/:id
export async function getWorkflowById(req, res) {
  try {
    const { id } = req.params;

    // Fetch workflow with its nodes and edges (relationships)
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single();                // Return single object instead of array

    if (workflowError) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    // Fetch nodes for this workflow
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*')
      .eq('workflow_id', id);

    // Fetch edges (connections) for this workflow
    const { data: edges, error: edgesError } = await supabase
      .from('edges')
      .select('*')
      .eq('workflow_id', id);

    if (nodesError || edgesError) {
      return res.status(500).json({ error: 'Error fetching workflow data' });
    }

    // Return complete workflow with nodes and edges
    res.json({
      workflow,
      nodes,
      edges
    });
  } catch (err) {
    console.error('Error fetching workflow:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ========== UPDATE WORKFLOW ==========
// PUT /api/workflows/:id
export async function updateWorkflow(req, res) {
  try {
    const { id } = req.params;
    const { name, description, enabled } = req.body;

    // Build update object with only provided fields
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (enabled !== undefined) updates.enabled = enabled;
    updates.updated_at = new Date();

    // Update in Supabase
    const { data, error } = await supabase
      .from('workflows')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json({
      message: 'Workflow updated successfully',
      workflow: data[0]
    });
  } catch (err) {
    console.error('Error updating workflow:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ========== DELETE WORKFLOW ==========
// DELETE /api/workflows/:id
export async function deleteWorkflow(req, res) {
  try {
    const { id } = req.params;

    // Delete workflow (nodes and edges cascade automatically due to DB constraints)
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: 'Workflow deleted successfully' });
  } catch (err) {
    console.error('Error deleting workflow:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ========== KEY CONCEPTS EXPLAINED ==========
/*
1. async/await: Allows waiting for database operations to finish
   - async function returns a Promise
   - await pauses execution until the Promise resolves
   - If database is slow, it waits for response before continuing

2. try/catch: Error handling
   - try: attempt the operation
   - catch: if something goes wrong, handle the error

3. res.status().json(): Send response back to frontend
   - status(201): Created (new resource)
   - status(400): Bad Request (user error)
   - status(404): Not Found
   - status(500): Server error
   - json(): Sends data as JSON

4. Database Operations:
   - .from('table_name'): Select which table
   - .insert([data]): Add new rows
   - .select(): Return the data
   - .eq('column', value): WHERE column = value (filter)
   - .update(data): Modify rows
   - .delete(): Remove rows
*/